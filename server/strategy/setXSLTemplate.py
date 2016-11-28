#coding=utf-8
#author:chenglusong
#time:2016-11-15 18:09:22
#参数：xpath共同前缀，所有的xpath字典
def setForTemplate(fors,dataStrs):
    forS = "<xsl:for-each select=" + fors + ">" + \
           "<xsl:if test=\"position() != 1\"><xsl:text>,</xsl:text></xsl:if>" + \
           dataStrs + \
           "</xsl:for-each>"
    return  forS


def setDataTemplate(name,xpath):
    dataStr = ''
    if(name != '' and xpath != ''):
        dataStr = name + ":\"<xsl:value-of select= \"normalize-space(translate(concat(" + xpath+"),'&quot;','\&quot;'))\" />\"\n"


    return dataStr

def setTemplate(forS):
    tempalteStr = """
     <xsl:stylesheet version="1.0"
     	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
     	xmlns:xpath="xalan://com.neusoft.unieap.codegen.xpathFunction.XpathFunction"
     	extension-element-prefixes="xpath">
     	<xsl:output method="text" />
             <xsl:template match="/">""" + forS + """
             </xsl:template>
     </xsl:stylesheet>
     """
    return tempalteStr


def setXSLTemplate(xpathArray,dic):

    name=''
    dataStrs=''
    forStr=""
    xpath=""

    #这个value是一个数组xpathArray是一个数组的数组,是xpath的前缀,xpathArray是前缀数组
    for value in xpathArray:

        if ''.join(value) != '':
            valueStr = ''.join(value)
            i = valueStr.find('*')
            if i != -1:
                ##遍历字典 找到同一个头的xpath表达式
                for key in dic.keys():
                    tmplateArray = dic[key].split(';')
                    for v in tmplateArray:
                        name = key

                        if v != '':
                            v = v[len(valueStr):]
                            xpath = xpath+'./'+v+','
                    xpath = xpath[:len(xpath) - 1]
                    dataStrs = dataStrs + setDataTemplate('\"'+name+'\"',xpath+",''")
                forStr = forStr + setForTemplate('\"'+valueStr[0:i]+'\"', dataStrs)

    return setTemplate(forStr);