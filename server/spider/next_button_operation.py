# coding=utf-8
# author:chenglusong


class is_special:
    def __init__(self):
        pass

    def _is_special(self, url):
        states = False
        
        return states
    def turn_page(self, browser, next_button_type, next_button_xpath):
        if next_button_type == "CLICK":

                    # 将所有的地址栏的href连接地址通过字典来进行存储
                    # 其中key就是href值，value就是对应的从browser中获得的元素
                    # 每一次得到地址栏中的所有href，判断这些href是否存在
                    # 如果存在，并且value值不是was_read则更新value，因为翻页后，同一个位置的元素有可能已经变了，而且这个页面还没有被点击
                    # 如果不存，插入key -value
                    # 所有的href遍历结束后，将这些开始寻找第一个value不是 was_read的元素就行点击，并将他的value更新为was_read  #

                    _has_next_button = False
                    next_buttons = browser.find_elements_by_xpath(next_button_xpath + '//*[@href]')
                    index = -1
                    for element in next_buttons:
                        inner_html = element.text;
                        index = inner_html.find('下一页')
                        if index == -1:
                            index = inner_html.find('后页')
                            if index == -1:
                                index = inner_html.find('ext')
                    if index != -1:
                        _has_next_button = True
                        _has_available_url = True
                        element.click();


                    if not _has_next_button :
                        global href_dic

                        # get all element with href attribute

                        for element in next_buttons:
                            href_value = element.get_attribute('href');

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
                                    browser.back();
                                    retry = True;
                                    print """ERROR"""
                                    browser.refresh();
                                    browser.get_screenshot_as_file('D:/res.png')
                                    break
                    elif next_button_type == 'SCROLLING':
                        # 如果下一页的实现是通过滑动鼠标滚轮来实现的
                        # ToDo:下一页的实现是通过滑动鼠标滚轮来实现的怎么办
                        pass

