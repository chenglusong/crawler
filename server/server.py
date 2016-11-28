#coding=utf-8
from selenium import webdriver
import time
from urllib import unquote
import urllib2
import zlib
from twisted.web.resource import Resource
from twisted.web import server
from twisted.web import static
from twisted.internet import reactor
from css_utils import process_css
from six.moves.urllib_parse import urlparse
from twisted.web.static import File
from strategy.parseXpath import parseSameLineXpath
from strategy.setXSLTemplate import setXSLTemplate
from strategy.commonFunction import removeDuplicates
from spider.mainSpider import crawlData
import json


import sys
reload(sys)
sys.setdefaultencoding('utf-8')

PORT = 9001

scriptFile = open('E:/platformWorkspace/weblib/tree-mirror-client.js','r')
try:
	scriptStr = scriptFile.read()
finally:
	scriptFile.close()

imagesTypes = ('jpg','png','gif')
pageUrl=''
browser=''
class ProxyResource(Resource):

  def _isImageResource(self,url):
	urlInfo = urlparse(url)
	url = urlInfo.path
	host = urlInfo.netloc
	indexOf = url.rfind('.')
	if indexOf > 0:
		suffix = url[indexOf+1:len(url)]
		if suffix in imagesTypes:
			return True
	elif host.startswith('image.') or host.startswith('img.'):
		return True
	return False

  def render(self, request):
	url = request.args['url'][0]
	referer = request.args['referer'][0]
	#tabid = int(request.args['tabid'][0])
	headers = {
		'referer' : referer,
		'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Encoding' : 'gzip, deflate, sdch',
		'Accept-Language' : 'zh-CN,zh;q=0.8,en;q=0.6',
		'Cache-Control' : 'no-cache',
		'Pragma' : 'no-cache',
		'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
	}
	#if self._isImageResource(url):
		#print url + "is image url"
		#headers['Accept'] = 'image/webp,*/*;q=0.8'
		#print headers
	req = urllib2.Request(url,headers=headers)
	htmlStr=''
	if(url.find('http://')!=-1 or url.find('https://')!= -1):
		response = urllib2.urlopen(req)
		headers = response.headers
		htmlStr = response.read()
		# print response.info()
		if "gzip" == headers.get('Content-Encoding'):
			htmlStr = zlib.decompress(htmlStr, 16 + zlib.MAX_WBITS)
		for header in ('Content-Type', 'Cache-Control', 'Pragma', 'Vary', 'Max-Age'):
			if header in headers:
				request.setHeader(header, headers[header])
		if headers.get('Content-Type').strip().startswith('text/css'):
			try:
				return process_css(htmlStr, url).decode('gbk').encode('utf-8')
			except:
				return process_css(htmlStr, url)
	return htmlStr

class PageResource(Resource):
	def render_GET(self, request):
	  	url = request.args['url'][0]
		global pageUrl
		pageUrl = url
		print url
		global browser
		browser = webdriver.PhantomJS(executable_path='D:/phantomjs-windows/bin/phantomjs.exe')
		#CNKI策略
		if (url.find('epub.cnki.net') > 0):
			##step1:访问CNKI建立连接
			index = url.find('keyValue=');
			if index != -1:
				endIndex = url.find('&S=')
				if endIndex != -1:
					keyword = url[index + 9:endIndex]
					keyword = unquote(keyword).decode('utf-8');
					browser.get('http://www.cnki.net')

					###step2：手动搜索
					time.sleep(2)
					button = browser.find_element_by_id('btnSearch');
					text = browser.find_element_by_class_name('rekeyword')
					text.send_keys(keyword);
					button.click();
					time.sleep(2)

		###CNKI策略结束
		browser.get(url)
	  	time.sleep(3)
	  	browser.execute_script(scriptStr)
	  	htmlStr = browser.execute_script("return new Page('"+url+"').serializeNodes()")
	  	browser.quit()

	  	return htmlStr.encode("utf-8")

#author：chenglusong
#time：2016-11-15 15:30:30
next_button_xpath=''
class selectedData(Resource):
	def render_GET(self, request):
		xpath = request.args['selected']
		print xpath
		dic = json.loads(xpath[0])
        ###解析传来的数据得到解析表达式?

		tmplate =''
		linesXpath =[]
		tmplateArray=[]
		for key in dic.keys():
			###首先 进行同一个字段的xpath提取规则
			if dic[key] != '':
				tmplateArray = parseSameLineXpath(dic[key].split(';'))
				#得到了每一行的Xpath表达式
				linesXpath = linesXpath + tmplateArray
			else:
				del dic[key]
		linesXpath = removeDuplicates(linesXpath)
		tmplate = setXSLTemplate(linesXpath,dic)
		global  next_button_xpath
		crawlData(pageUrl,tmplate,'CLICK',''.join(next_button_xpath))
		return 'success'
class nextButton(Resource):
	def render_GET(self, request):
		global next_button_xpath
		global browser
		next_button_xpath = request.args['nextButtonXpath']
		print next_button_xpath

		return 'success'
	
resource = Resource()

resource = static.File('../web')
resource.putChild('proxy', ProxyResource())
resource.putChild('nextButton', nextButton())
resource.putChild('page', PageResource())
resource.putChild('selected', selectedData())
resource.putChild('crawler.html', File("../web/crawler.html"))

reactor.listenTCP(PORT, server.Site(resource))
reactor.run()
