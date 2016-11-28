#coding = utf-8
from lxml import etree

from selenium import webdriver
import time

tempalteStr = '''
     <xsl:stylesheet version="1.0"
     	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
     	xmlns:xpath="xalan://com.neusoft.unieap.codegen.xpathFunction.XpathFunction"
     	extension-element-prefixes="xpath">
     	<xsl:output method="text" />
            <xsl:template match="/">
                <xsl:for-each select="//body/div[3]/div[1]/div/div[1]/div/ul/li">
                    <xsl:if test="position() != 1"><xsl:text>,</xsl:text></xsl:if>
                        "dd":"<xsl:value-of select= "normalize-space(translate(concat(.//div[2]/h2/a,.//div[2]/div[2]/span[3],.//div[2]/p,),'&quot;','\&quot;'))" />"
                    </xsl:for-each>
                </xsl:template>
     </xsl:stylesheet>
'''
#transform xslt template string to document
xslt_root = etree.XML(tempalteStr )
#compile xlst template
transform = etree.XSLT(xslt_root)

url = "https://book.douban.com/tag/%E5%B0%8F%E8%AF%B4"
# use webdriver.PhantomJS to load url
browser = webdriver.PhantomJS(executable_path='D:/phantomjs-windows/bin/phantomjs.exe')
browser.get(url)
# wait render page completely
time.sleep(3)
# execute javascript to get page content
htmlStr = browser.execute_script("return document.documentElement.outerHTML")
#transform html string to document
browser.get_screenshot_as_file('D:/pic/res.png')
html = etree.HTML(htmlStr )
#transform html with xslt template
result_tree = transform(html)
#write result content to file
resultFile = open('e:/result.txt', 'w')
try:
    resultFile.write(str(result_tree))
    print (result_tree)
finally:
    resultFile.close()