#coding=utf-8
#author:chenglusong
#Time:2016-11-15 11:32:34
#参数：xpathArray 同一个字段 用户点选获得的xpath表达式
#return：tmpArr 提取的前缀模板
def parseSameLineXpath(xpathArray):
    tmpArr = []
    for m in (xpathArray):
        if m != '':
            print m
            index = m.find('*')
            if(index != -1):
                print m[0:index+1]
                tmpArr.append(m[0:index+1]);
            else:
                tmpArr.append(m)


    return tmpArr;

def parseDifferLineXpath(xpathArray):
    tmpArr = []
    return tmpArr;