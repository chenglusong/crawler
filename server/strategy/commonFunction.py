#coding=utf-8
# 数组去重#
def removeDuplicates(array):
    news_array=[]
    for m in  array:
        if m not in news_array:
            news_array.append(m)
    return news_array
