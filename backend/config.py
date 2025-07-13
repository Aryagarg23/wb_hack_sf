from dotenv import load_dotenv
import os
load_dotenv()

NEO4J_API_URL= os.getenv('NEO4J_API_URL')
NEO4J_USER=os.getenv('NEO4J_USER')
NEO4J_PASSWORD=os.getenv('NEO4J_PASSWORD')
OPENAI_API_KEY=os.getenv('OPENAI_API_KEY')
EXA_API_KEY=os.getenv('EXA_API_KEY')
WANDB_API_KEY=os.getenv('WANDB_API_KEY')
NEWS_API_KEY=os.getenv('NEWS_API_KEY')