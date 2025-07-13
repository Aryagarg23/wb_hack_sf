const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Fake search results generator with realistic content for better icon detection
function generateFakeLinks(query) {
  // Define different types of content based on query keywords
  const queryLower = query.toLowerCase();
  
  let contentType = 'general';
  if (queryLower.includes('github') || queryLower.includes('code') || queryLower.includes('programming')) {
    contentType = 'github';
  } else if (queryLower.includes('youtube') || queryLower.includes('video') || queryLower.includes('tutorial')) {
    contentType = 'youtube';
  } else if (queryLower.includes('twitter') || queryLower.includes('social')) {
    contentType = 'twitter';
  } else if (queryLower.includes('linkedin') || queryLower.includes('career') || queryLower.includes('job')) {
    contentType = 'linkedin';
  } else if (queryLower.includes('amazon') || queryLower.includes('shopping') || queryLower.includes('buy')) {
    contentType = 'amazon';
  } else if (queryLower.includes('spotify') || queryLower.includes('music')) {
    contentType = 'spotify';
  } else if (queryLower.includes('netflix') || queryLower.includes('movie')) {
    contentType = 'netflix';
  } else if (queryLower.includes('reddit') || queryLower.includes('discussion')) {
    contentType = 'reddit';
  } else if (queryLower.includes('stackoverflow') || queryLower.includes('question') || queryLower.includes('help')) {
    contentType = 'stackoverflow';
  } else if (queryLower.includes('wikipedia') || queryLower.includes('encyclopedia')) {
    contentType = 'wikipedia';
  } else if (queryLower.includes('arxiv') || queryLower.includes('research') || queryLower.includes('paper')) {
    contentType = 'arxiv';
  } else if (queryLower.includes('medium') || queryLower.includes('article') || queryLower.includes('blog')) {
    contentType = 'medium';
  } else if (queryLower.includes('notion') || queryLower.includes('document')) {
    contentType = 'notion';
  } else if (queryLower.includes('figma') || queryLower.includes('design')) {
    contentType = 'figma';
  } else if (queryLower.includes('discord') || queryLower.includes('chat')) {
    contentType = 'discord';
  } else if (queryLower.includes('slack') || queryLower.includes('team')) {
    contentType = 'slack';
  } else if (queryLower.includes('news') || queryLower.includes('article')) {
    contentType = 'news';
  }

  // Content templates for different types
  const contentTemplates = {
    github: [
      { title: `${query} - GitHub Repository`, link: `https://github.com/search?q=${encodeURIComponent(query)}`, snippet: `Open source code and projects related to ${query}. Find repositories, documentation, and developer resources.` },
      { title: `${query} - Programming Tutorial`, link: `https://github.com/topics/${encodeURIComponent(query)}`, snippet: `Learn ${query} with step-by-step tutorials, code examples, and best practices for developers.` },
      { title: `${query} - Developer Documentation`, link: `https://docs.github.com/en/search?query=${encodeURIComponent(query)}`, snippet: `Official documentation and guides for ${query} development and implementation.` },
      { title: `${query} - Code Examples`, link: `https://github.com/trending?q=${encodeURIComponent(query)}`, snippet: `Popular code examples and implementations for ${query} with community contributions.` },
      { title: `${query} - Software Development`, link: `https://github.com/search?type=repositories&q=${encodeURIComponent(query)}`, snippet: `Software development resources and tools for ${query} projects and applications.` }
    ],
    youtube: [
      { title: `${query} - YouTube Tutorial`, link: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, snippet: `Video tutorials and guides for ${query}. Learn step-by-step with visual demonstrations.` },
      { title: `${query} - Video Course`, link: `https://www.youtube.com/playlist?list=search&query=${encodeURIComponent(query)}`, snippet: `Complete video course covering ${query} from basics to advanced concepts.` },
      { title: `${query} - Educational Content`, link: `https://www.youtube.com/channel/UC/search?query=${encodeURIComponent(query)}`, snippet: `Educational videos and content about ${query} for learning and skill development.` },
      { title: `${query} - How-to Guide`, link: `https://www.youtube.com/watch?v=${encodeURIComponent(query)}`, snippet: `Step-by-step how-to guide for ${query} with practical examples and tips.` },
      { title: `${query} - Video Learning`, link: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+tutorial`, snippet: `Comprehensive video learning resources for ${query} with expert instructors.` }
    ],
    twitter: [
      { title: `${query} - Twitter Discussion`, link: `https://twitter.com/search?q=${encodeURIComponent(query)}`, snippet: `Latest tweets and discussions about ${query}. Follow conversations and trends.` },
      { title: `${query} - Social Media Updates`, link: `https://twitter.com/hashtag/${encodeURIComponent(query)}`, snippet: `Real-time social media updates and hashtag conversations about ${query}.` },
      { title: `${query} - Community Chat`, link: `https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query`, snippet: `Community discussions and expert opinions about ${query} on social media.` },
      { title: `${query} - Trending Topic`, link: `https://twitter.com/explore/tabs/trending`, snippet: `Trending discussions and viral content related to ${query} on social platforms.` },
      { title: `${query} - Social Updates`, link: `https://twitter.com/search?q=${encodeURIComponent(query)}&f=live`, snippet: `Live social media updates and real-time conversations about ${query}.` }
    ],
    linkedin: [
      { title: `${query} - Professional Network`, link: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`, snippet: `Professional networking and career opportunities related to ${query}. Connect with industry experts.` },
      { title: `${query} - Career Development`, link: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(query)}`, snippet: `Professional development courses and career advancement resources for ${query}.` },
      { title: `${query} - Industry Insights`, link: `https://www.linkedin.com/pulse/search?keywords=${encodeURIComponent(query)}`, snippet: `Industry insights and professional articles about ${query} from thought leaders.` },
      { title: `${query} - Job Opportunities`, link: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`, snippet: `Job opportunities and career paths related to ${query} in various industries.` },
      { title: `${query} - Professional Growth`, link: `https://www.linkedin.com/groups/search?keywords=${encodeURIComponent(query)}`, snippet: `Professional groups and communities focused on ${query} for networking and learning.` }
    ],
    amazon: [
      { title: `${query} - Amazon Products`, link: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`, snippet: `Shop for ${query} products on Amazon. Find deals, reviews, and recommendations.` },
      { title: `${query} - Shopping Guide`, link: `https://www.amazon.com/best-sellers/search?k=${encodeURIComponent(query)}`, snippet: `Best-selling ${query} products with customer reviews and ratings.` },
      { title: `${query} - Product Reviews`, link: `https://www.amazon.com/product-reviews/search?k=${encodeURIComponent(query)}`, snippet: `Customer reviews and ratings for ${query} products and services.` },
      { title: `${query} - Shopping Deals`, link: `https://www.amazon.com/deals/search?k=${encodeURIComponent(query)}`, snippet: `Special deals and discounts on ${query} products and services.` },
      { title: `${query} - Product Comparison`, link: `https://www.amazon.com/compare/search?k=${encodeURIComponent(query)}`, snippet: `Compare different ${query} products and find the best options for your needs.` }
    ],
    spotify: [
      { title: `${query} - Spotify Playlist`, link: `https://open.spotify.com/search/${encodeURIComponent(query)}`, snippet: `Discover ${query} music and playlists on Spotify. Listen to curated collections.` },
      { title: `${query} - Music Streaming`, link: `https://open.spotify.com/playlist/search?q=${encodeURIComponent(query)}`, snippet: `Stream ${query} music and audio content with high-quality sound.` },
      { title: `${query} - Audio Content`, link: `https://open.spotify.com/show/search?q=${encodeURIComponent(query)}`, snippet: `Audio content and podcasts related to ${query} for entertainment and learning.` },
      { title: `${query} - Music Discovery`, link: `https://open.spotify.com/artist/search?q=${encodeURIComponent(query)}`, snippet: `Discover new ${query} artists and music recommendations.` },
      { title: `${query} - Audio Entertainment`, link: `https://open.spotify.com/album/search?q=${encodeURIComponent(query)}`, snippet: `Audio entertainment and music albums related to ${query}.` }
    ],
    netflix: [
      { title: `${query} - Netflix Shows`, link: `https://www.netflix.com/search?q=${encodeURIComponent(query)}`, snippet: `Watch ${query} movies and TV shows on Netflix. Stream entertainment content.` },
      { title: `${query} - Movie Streaming`, link: `https://www.netflix.com/browse/search?q=${encodeURIComponent(query)}`, snippet: `Stream ${query} movies and entertainment content with high-quality video.` },
      { title: `${query} - TV Series`, link: `https://www.netflix.com/title/search?q=${encodeURIComponent(query)}`, snippet: `TV series and shows related to ${query} for entertainment and relaxation.` },
      { title: `${query} - Entertainment Content`, link: `https://www.netflix.com/browse/genre/search?q=${encodeURIComponent(query)}`, snippet: `Entertainment content and media related to ${query} for viewing pleasure.` },
      { title: `${query} - Video Streaming`, link: `https://www.netflix.com/search?q=${encodeURIComponent(query)}&jbv=`, snippet: `Video streaming content and entertainment related to ${query}.` }
    ],
    reddit: [
      { title: `${query} - Reddit Discussion`, link: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`, snippet: `Community discussions and threads about ${query} on Reddit. Join the conversation.` },
      { title: `${query} - Community Forum`, link: `https://www.reddit.com/r/search?q=${encodeURIComponent(query)}`, snippet: `Community forums and subreddits dedicated to ${query} discussions and sharing.` },
      { title: `${query} - User Discussions`, link: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&restrict_sr=on`, snippet: `User-generated discussions and content about ${query} from the Reddit community.` },
      { title: `${query} - Community Content`, link: `https://www.reddit.com/r/all/search/?q=${encodeURIComponent(query)}`, snippet: `Community-generated content and discussions about ${query} across all subreddits.` },
      { title: `${query} - Social Discussion`, link: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&sort=new`, snippet: `Latest social discussions and community content about ${query}.` }
    ],
    stackoverflow: [
      { title: `${query} - Stack Overflow Q&A`, link: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`, snippet: `Programming questions and answers about ${query}. Get help from the developer community.` },
      { title: `${query} - Developer Help`, link: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(query)}`, snippet: `Developer help and technical support for ${query} programming and development.` },
      { title: `${query} - Code Solutions`, link: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}&tab=votes`, snippet: `Voted solutions and code examples for ${query} programming challenges.` },
      { title: `${query} - Technical Support`, link: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}&tab=newest`, snippet: `Latest technical questions and support for ${query} development issues.` },
      { title: `${query} - Programming Help`, link: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}&tab=active`, snippet: `Active programming discussions and help for ${query} development problems.` }
    ],
    wikipedia: [
      { title: `${query} - Wikipedia Article`, link: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`, snippet: `Comprehensive encyclopedia article about ${query}. Learn facts and background information.` },
      { title: `${query} - Knowledge Base`, link: `https://en.wikipedia.org/wiki/Special:Search/${encodeURIComponent(query)}`, snippet: `Knowledge base and educational content about ${query} from Wikipedia.` },
      { title: `${query} - Encyclopedia Entry`, link: `https://en.wikipedia.org/wiki/Category:${encodeURIComponent(query)}`, snippet: `Encyclopedia entries and categories related to ${query} for research and learning.` },
      { title: `${query} - Educational Content`, link: `https://en.wikipedia.org/wiki/Portal:${encodeURIComponent(query)}`, snippet: `Educational content and learning resources about ${query} from Wikipedia.` },
      { title: `${query} - Reference Material`, link: `https://en.wikipedia.org/wiki/Template:${encodeURIComponent(query)}`, snippet: `Reference material and documentation about ${query} for academic research.` }
    ],
    arxiv: [
      { title: `${query} - Research Paper`, link: `https://arxiv.org/search/?query=${encodeURIComponent(query)}`, snippet: `Academic research papers and scientific publications about ${query}. Access scholarly content.` },
      { title: `${query} - Scientific Research`, link: `https://arxiv.org/abs/search?query=${encodeURIComponent(query)}`, snippet: `Scientific research and academic studies related to ${query} from arXiv.` },
      { title: `${query} - Academic Papers`, link: `https://arxiv.org/list/cs/search?query=${encodeURIComponent(query)}`, snippet: `Academic papers and research publications about ${query} in computer science.` },
      { title: `${query} - Research Publications`, link: `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all`, snippet: `Research publications and scholarly articles about ${query} from academic sources.` },
      { title: `${query} - Scientific Literature`, link: `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=author`, snippet: `Scientific literature and research findings about ${query} from leading researchers.` }
    ],
    medium: [
      { title: `${query} - Medium Article`, link: `https://medium.com/search?q=${encodeURIComponent(query)}`, snippet: `In-depth articles and blog posts about ${query}. Read expert insights and analysis.` },
      { title: `${query} - Blog Content`, link: `https://medium.com/tag/${encodeURIComponent(query)}`, snippet: `Blog content and written articles about ${query} from Medium writers.` },
      { title: `${query} - Expert Insights`, link: `https://medium.com/search?q=${encodeURIComponent(query)}&source=home`, snippet: `Expert insights and analysis about ${query} from industry professionals.` },
      { title: `${query} - Written Content`, link: `https://medium.com/search?q=${encodeURIComponent(query)}&source=user`, snippet: `Written content and articles about ${query} from community contributors.` },
      { title: `${query} - Article Collection`, link: `https://medium.com/search?q=${encodeURIComponent(query)}&source=publication`, snippet: `Collection of articles and written content about ${query} from various publications.` }
    ],
    notion: [
      { title: `${query} - Notion Document`, link: `https://www.notion.so/search?q=${encodeURIComponent(query)}`, snippet: `Documentation and notes about ${query} in Notion. Organize your knowledge.` },
      { title: `${query} - Note Taking`, link: `https://www.notion.so/templates/search?q=${encodeURIComponent(query)}`, snippet: `Note-taking templates and documentation for ${query} projects and ideas.` },
      { title: `${query} - Knowledge Base`, link: `https://www.notion.so/workspace/search?q=${encodeURIComponent(query)}`, snippet: `Knowledge base and documentation about ${query} for personal and team use.` },
      { title: `${query} - Document Organization`, link: `https://www.notion.so/search?q=${encodeURIComponent(query)}&source=workspace`, snippet: `Document organization and knowledge management for ${query} content.` },
      { title: `${query} - Workspace Notes`, link: `https://www.notion.so/search?q=${encodeURIComponent(query)}&source=template`, snippet: `Workspace notes and documentation templates for ${query} projects.` }
    ],
    figma: [
      { title: `${query} - Figma Design`, link: `https://www.figma.com/search?model_type=files&q=${encodeURIComponent(query)}`, snippet: `Design files and UI/UX work related to ${query}. Explore creative designs.` },
      { title: `${query} - UI/UX Design`, link: `https://www.figma.com/community/search?model_type=files&q=${encodeURIComponent(query)}`, snippet: `UI/UX design work and creative projects related to ${query}.` },
      { title: `${query} - Design Resources`, link: `https://www.figma.com/search?model_type=teams&q=${encodeURIComponent(query)}`, snippet: `Design resources and creative assets for ${query} projects and applications.` },
      { title: `${query} - Creative Work`, link: `https://www.figma.com/search?model_type=projects&q=${encodeURIComponent(query)}`, snippet: `Creative work and design projects related to ${query} from the design community.` },
      { title: `${query} - Design Community`, link: `https://www.figma.com/community/search?model_type=users&q=${encodeURIComponent(query)}`, snippet: `Design community and creative professionals working on ${query} projects.` }
    ],
    discord: [
      { title: `${query} - Discord Server`, link: `https://discord.com/search?q=${encodeURIComponent(query)}`, snippet: `Discord servers and communities focused on ${query}. Join discussions and chat.` },
      { title: `${query} - Community Chat`, link: `https://discord.com/channels/search?q=${encodeURIComponent(query)}`, snippet: `Community chat channels and discussions about ${query} on Discord.` },
      { title: `${query} - Communication Platform`, link: `https://discord.com/invite/search?q=${encodeURIComponent(query)}`, snippet: `Communication platform and chat communities for ${query} enthusiasts and users.` },
      { title: `${query} - Chat Communities`, link: `https://discord.com/servers/search?q=${encodeURIComponent(query)}`, snippet: `Chat communities and discussion groups focused on ${query} topics and interests.` },
      { title: `${query} - Social Communication`, link: `https://discord.com/channels/search?q=${encodeURIComponent(query)}&type=guild`, snippet: `Social communication and community building around ${query} topics and projects.` }
    ],
    slack: [
      { title: `${query} - Slack Workspace`, link: `https://slack.com/search?q=${encodeURIComponent(query)}`, snippet: `Slack workspaces and team collaboration for ${query} projects and organizations.` },
      { title: `${query} - Team Collaboration`, link: `https://slack.com/workspace-signin/search?q=${encodeURIComponent(query)}`, snippet: `Team collaboration and communication tools for ${query} development and management.` },
      { title: `${query} - Business Communication`, link: `https://slack.com/help/search?q=${encodeURIComponent(query)}`, snippet: `Business communication and team coordination for ${query} related work and projects.` },
      { title: `${query} - Workplace Tools`, link: `https://slack.com/features/search?q=${encodeURIComponent(query)}`, snippet: `Workplace tools and collaboration features for ${query} teams and organizations.` },
      { title: `${query} - Professional Communication`, link: `https://slack.com/downloads/search?q=${encodeURIComponent(query)}`, snippet: `Professional communication and team management for ${query} related activities.` }
    ],
    news: [
      { title: `${query} - Latest News`, link: `https://news.google.com/search?q=${encodeURIComponent(query)}`, snippet: `Latest news and current events about ${query}. Stay updated with recent developments.` },
      { title: `${query} - News Articles`, link: `https://www.bbc.com/news/search?q=${encodeURIComponent(query)}`, snippet: `News articles and reporting about ${query} from trusted news sources.` },
      { title: `${query} - Current Events`, link: `https://www.reuters.com/search/news?blob=${encodeURIComponent(query)}`, snippet: `Current events and breaking news related to ${query} from Reuters.` },
      { title: `${query} - News Coverage`, link: `https://www.cnn.com/search?q=${encodeURIComponent(query)}`, snippet: `News coverage and media reporting about ${query} from CNN.` },
      { title: `${query} - Journalism`, link: `https://www.nytimes.com/search?query=${encodeURIComponent(query)}`, snippet: `Journalism and investigative reporting about ${query} from The New York Times.` }
    ],
    general: [
      { title: `${query} - Search Results`, link: `https://www.google.com/search?q=${encodeURIComponent(query)}`, snippet: `Comprehensive search results for ${query}. Find information, resources, and answers.` },
      { title: `${query} - Information Guide`, link: `https://www.bing.com/search?q=${encodeURIComponent(query)}`, snippet: `Information guide and resources about ${query}. Learn and discover new content.` },
      { title: `${query} - Web Search`, link: `https://www.google.com/search?q=${encodeURIComponent(query)}`, snippet: `Web search results for ${query}. Find websites, articles, and online resources.` },
      { title: `${query} - Online Resources`, link: `https://www.wikipedia.org/wiki/${encodeURIComponent(query)}`, snippet: `Online resources and reference materials about ${query} for research and learning.` },
      { title: `${query} - Internet Search`, link: `https://www.google.com/search?q=${encodeURIComponent(query)}&source=lnms`, snippet: `Internet search results and web content related to ${query}.` }
    ]
  };

  // Return the appropriate content for the query type
  return contentTemplates[contentType] || contentTemplates.general;
}

// API endpoint to handle queries
app.post('/api/query', (req, res) => {
  const { query } = req.body;
  
  if (!query || query.trim() === '') {
    return res.status(400).json({ 
      error: 'Query is required' 
    });
  }
  
  console.log(`Received query: "${query}"`);
  
  // Generate fake links based on the query
  const links = generateFakeLinks(query.trim());
  
  // Simulate some processing time
  setTimeout(() => {
    res.json({
      success: true,
      query: query,
      links: links,
      timestamp: new Date().toISOString()
    });
  }, 500);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Fake backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Fake backend server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Query endpoint: http://localhost:${PORT}/api/query`);
}); 