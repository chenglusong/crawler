# coding=utf-8
from lxml import etree
from selenium import webdriver
import time
import random

from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import sys
sys.path.append("..")
from strategy.strategy_base import *

href_dic = {}
def init_browser():
    headers = {'Accept': '*/*',
               'Accept-Encoding': 'gzip, deflate, sdch',
               'Accept-Language': 'en-US,en;q=0.8',
               'Cache-Control': 'max-age=0',
               'Referer': 'https://www.baidu.com',
               'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36'
               }
    dcap = dict(DesiredCapabilities.PHANTOMJS)
    dcap["phantomjs.page.settings.userAgent"] = (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:25.0) Gecko/20100101 Firefox/25.0 "
    )
    browser = webdriver.PhantomJS(executable_path='D:/phantomjs-windows/bin/phantomjs.exe', desired_capabilities=dcap)
    return browser

# author：chenglusong
# time：2016-11-16 15:44:15
# 参数：
        #url:攫取数据的网页的URL，
        #tempalteStr：数据模板，
        #nextButtonType:下一页按钮的类型，值为：CLICK，SCROLLING
        #nextButtonSelector:下一页按钮的selector该值默认为none,
        #deep：数据采集的深度该值默认为-1表示没有限制
# 函数作用：来进行数据挖掘
# 返回值：无


def crawlData(url,tempalteStr,nextButtonType='none',next_button_xpath='none',deep = -1):
    browser = init_browser()
    """该变量表示是否存在下一页的按钮，以防刚开始存在翻页按钮后来翻着翻着到最后一页没了，而去找页码这种情况"""
    _has_next_button = False
    # use webdriver.PhantomJS to load url
    resultFile = open('e:/result.txt', 'a')
    xslt_root = etree.XML(tempalteStr)
    # compile xlst template
    transform = etree.XSLT(xslt_root)
    keyword = strategy_base.is_special(url)
    if  keyword == 'NONE':
        browser.get(url)
        retry = False

        """
       _has_available_url：该变量标识着循环读取的循环是否结束，该变量为false时候代表所有的可用URL都被读取完毕,循环结束
       """
        _has_available_url = True
        while (deep > 0 or deep == -1) and _has_available_url:
            _has_available_url = False
            # wait render page completely
            time.sleep(random.uniform(2, 4))
            # execute javascript to get page content

            if not retry:
                retry = False

                htmlStr = browser.execute_script("return document.documentElement.outerHTML")
                # transform html string to document
                html = etree.HTML(htmlStr)
                # transform html with xslt template

                result_tree = transform(html)
                print (result_tree)
                resultFile.write(str(result_tree))
            ###点击下一页的按钮

            if deep > 1 or deep == -1:

                if nextButtonType == "CLICK":

                    # 将所有的地址栏的href连接地址通过字典来进行存储
                    # 其中key就是href值，value就是对应的从browser中获得的元素
                    # 每一次得到地址栏中的所有href，判断这些href是否存在
                    # 如果存在，并且value值不是was_read则更新value，因为翻页后，同一个位置的元素有可能已经变了，而且这个页面还没有被点击
                    # 如果不存，插入key -value
                    # 所有的href遍历结束后，将这些开始寻找第一个value不是 was_read的元素就行点击，并将他的value更新为was_read  #


                    next_buttons = browser.find_elements_by_xpath(next_button_xpath + '//*[@href]')

                    for element in next_buttons:
                        inner_html = element.text
                        index = inner_html.find('下一页')
                        if index == -1:
                            index = inner_html.find('后页')
                            if index == -1:
                                index = inner_html.find('ext')
                        if index != -1:
                            _has_next_button = True
                            _has_available_url = True
                            element.click()
                            break

                    if not _has_next_button and ( not _has_next_button ):
                        global href_dic

                        # get all element with href attribute

                        for element in next_buttons:
                            href_value = element.get_attribute('href')

                            _is_existence = href_dic.has_key(href_value)
                            # href还没有存
                            if not _is_existence:
                                href_dic[href_value] = element

                            elif href_dic.get(href_value) != 'was_read':
                                # href has been existence and not read,update it
                                href_dic[href_value] = element

                        ##traversal href_dic and find the first value is not equal to was_read

                        for key in href_dic.keys():
                            if (href_dic[key] != 'was_read'):
                                try:
                                    _has_available_url = True
                                    browser.get(key)
                                    # clicked_button.click()
                                    href_dic[key] = 'was_read'

                                    browser.get_screenshot_as_file('D:/res.png')
                                    break
                                except:
                                    browser.back()
                                    retry = True
                                    print ("""ERROR""")
                                    browser.refresh()
                                    browser.get_screenshot_as_file('D:/res.png')
                                    break
                elif nextButtonType == 'SCROLLING':
                    # 如果下一页的实现是通过滑动鼠标滚轮来实现的
                    # ToDo:下一页的实现是通过滑动鼠标滚轮来实现的怎么办
                    pass

            if (deep != -1): deep = deep - 1;
        if not _has_available_url:
            print ("爬取结束")
        else:
            print ("异常结束")
            browser.get_screenshot_as_file('D:/res.png')

        # 退出浏览器，节省资源
        browser.quit();
    else:
        strategy_base.operation(keyword, url, browser, transform, next_button_xpath, deep)
