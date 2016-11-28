# coding=utf-8
from urllib import unquote
from lxml import etree
from pytesser import pytesser
import time
import random
import os
from PIL import Image


"""
检查是否是特殊的链接而采用特殊的策略
"""


class strategy_base:
    def __init__(self):
        pass

    """
    CNKI策略
    author:chenglusong
    time：2016-11-23 10:11:04
    参数：
        keyword：识别是哪一种特殊的策略
        url：需要处理的URL
        browser:phantomjs浏览器用来访问页面
        transform:xpath解析模板
        deep翻页深度

    """

    @staticmethod
    def is_special(url):
        # use webdriver.PhantomJS to load url
        flag = 'NONE'
        index = url.find('cnki.net')
        if index != -1:
            flag = 'CNKI'
        return flag

    @staticmethod
    def operation(keyword, url, browser, transform, next_button_xpath, deep):
        href_dic = {}
        if keyword == 'CNKI':
            index = url.find('keyValue=')
            if index != -1:
                end_index = url.find('&S=')
                if end_index != -1:
                    keywords = url[index + 9:end_index]
                    # keywords = (keywords)
                    browser.get('http://www.cnki.net')
                    button = browser.find_element_by_id('btnSearch')
                    text = browser.find_element_by_class_name('rekeyword')
                    keywords = unquote(keywords).decode('utf-8')
                    text.send_keys(keywords)
                    button.click()
                    #wait one second
                    time.sleep(1)
                    retry = False
                    browser.get(url)
                    """
                    _has_available_url：该变量标识着循环读取的循环是否结束，该变量为false时候代表所有的可用URL都被读取完毕,循环结束

                    """

                    _has_available_url = True
                    try:
                        while (deep > 0 or deep == -1) and _has_available_url:
                            _has_available_url = False
                            # wait render page completely
                            time.sleep(random.uniform(1, 3))
                            # execute javascript to get page content

                            if not retry:
                                retry = False

                                html_str = browser.execute_script("return document.documentElement.outerHTML")
                                # transform html string to document
                                html = etree.HTML(html_str)
                                # transform html with xslt template

                                result_tree = transform(html)

                                print (result_tree)

                            # 点击下一页的按钮
                            if deep > 1 or deep == -1:
                                # 首先看看是否需要输入验证码才能够进行访问
                                check_coede = browser.find_elements_by_id('CheckCodeImg')

                                if len(check_coede) == 1:

                                    random_int = random.randint(100000, 999999)
                                    pic_name = '%d' % random_int
                                    pic_path = './tmp/' + pic_name + '.jpg'
                                    browser.get_screenshot_as_file(pic_path)
                                    img = Image.open(pic_path)

                                    document_str = browser.execute_script("return document.documentElement.outerHTML")
                                    _error_message_index = document_str.find('验证码错误')

                                    if _error_message_index == -1:
                                        region = (32, 60, 95, 82)
                                    else:
                                        region = (32, 96, 95, 118)
                                    crop_img = img.crop(region)
                                    crop_img.save(pic_path)

                                    im = Image.open(pic_path)

                                    imgry = im.convert('L')

                                    threshold = 120
                                    table = []
                                    for i in range(256):
                                        if i < threshold:
                                            table.append(0)
                                        else:
                                            table.append(1)
                                    out = imgry.point(table, '1')
                                    out.save(pic_path)
                                    code = pytesser.image_file_to_string(pic_path)
                                    if code == '':
                                        code = 'a'
                                    check_code_input_field = browser.find_element_by_id('CheckCode')
                                    check_code_input_field.send_keys(code.decode('utf-8'))
                                    button = browser.find_element_by_xpath('/html/body/p[1]/input[2]')
                                    button.click()
                                    os.remove(pic_path)
                                    _has_available_url = True
                                else:
                                    # 通过地址栏将所有的地址存起来，有不同的就加进去吧
                                    # 将所有的地址栏的href连接地址通过字典来进行存储
                                    # 其中key就是href值，value就是对应的从browser中获得的元素
                                    # 每一次得到地址栏中的所有href，判断这些href是否存在
                                    # 如果存在，并且value值不是was_read则更新value，因为翻页后，同一个位置的元素有可能已经变了，而且这个页面还没有被点击
                                    # 如果不存，插入key -value
                                    # 所有的href遍历结束后，将这些开始寻找第一个value不是 was_read的元素就行点击，并将他的value更新为was_read  #
                                    # get all element with href attribute
                                    _has_next_button = False
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
                                    #没有下一页按钮，安心的找下一页的URL吧
                                    if not _has_next_button:
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
                                            if href_dic[key] != 'was_read':
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
                                                    print ("ERROR")
                                                    browser.refresh()
                                                    browser.get_screenshot_as_file('D:/res.png')
                                                    break
                                if deep != -1:
                                    deep -= 1

                        if not _has_available_url:
                            print ("爬取结束")
                        else:
                            print ("异常结束")
                        # 退出浏览器，节省资源
                        browser.quit()
                    except:
                        print ("异常结束")
                        browser.get_screenshot_as_file('D://ex.png')
