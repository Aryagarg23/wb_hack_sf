from dotenv import load_dotenv
import os
load_dotenv()

NEO4J_API_URL= os.getenv('NEO4J_API_URL')
NEO4J_USER=os.getenv('NEO4J_USER')
NEO4J_PASSWORD=os.getenv('NEO4J_PASSWORD')