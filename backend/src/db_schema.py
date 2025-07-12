class Concept:
    def __init__(self, name, intent, embedding):
        self.name = name
        self.intent = intent
        self.embedding = embedding
        # This is inherited from the query that created
        # this node

    def getName(self):
        return self.name

class Query:
    def  __init__(self, content, intent):
        self.content = content
        self.intent = intent
        # Intent is just intent bucket, from roberta first time

    def getContent(self):
        return self.content
    
class Link:
    def __init__(self, address):
        self.address = address


    def getAddress(self):
        return self.address