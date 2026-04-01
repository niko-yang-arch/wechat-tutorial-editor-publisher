import requests
from bs4 import BeautifulSoup
from openai import OpenAI

class AISpider:
    def __init__(self, api_key):
        self.client = OpenAI(api_key=api_key)
    
    def smart_extract(self, url, target_description):
        """通过AI智能提取所需数据"""
        # 获取页面
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 简化HTML结构
        simplified = self._simplify_html(soup)
        
        # 让AI分析页面并返回数据提取规则
        prompt = f"""
        这是一个网页的HTML结构简化版本：
        {simplified[:3000]}
        
        我需要提取：{target_description}
        
        请分析HTML结构，返回JSON格式的：
        1. 数据定位的CSS选择器或XPath
        2. 提取规则（如文本、属性等）
        3. 可能的字段映射
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return self._parse_ai_response(response.choices[0].message.content)
    
    def _simplify_html(self, soup):
        """简化HTML，去除脚本、样式等"""
        for script in soup(["script", "style"]):
            script.decompose()
        return str(soup)[:5000]