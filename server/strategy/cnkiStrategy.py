#coding=utf-8
# ###针对中国知网的特殊分析策略
import strategy_base


class cnkiStrategy(strategy_base):


    def operation(self, url):
        ##http://epub.cnki.net/kns/brief/brief.aspx?pagename=ASP.brief_default_result_aspx&dbPrefix=SCDB&
        # dbCatalog=中国学术文献网络出版总库&ConfigFile=SCDBINDEX.xml&research=off&t=1478508960353&keyValue=ab&S=1&sorttype=(发表时间,'DATE') desc&queryid=4
        start = url.index('keyValue=');
        end = url.index('&S=');
        keyword = url[start + 9:end]
        print 'CNKI Strategy'

