import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { NewsArticle } from './entities/news-article.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsArticle)
    private newsRepository: Repository<NewsArticle>,
  ) {}

  async create(createNewsDto: CreateNewsDto): Promise<NewsArticle> {
    // Handle published_date
    let publishedDate: Date | null = null;
    if (createNewsDto.published_date) {
      publishedDate = new Date(createNewsDto.published_date);
    }

    // Handle tags
    let tagsArray: string[] = [];
    if (createNewsDto.tags) {
      if (Array.isArray(createNewsDto.tags)) {
        tagsArray = createNewsDto.tags;
      } else if (typeof createNewsDto.tags === 'string') {
        tagsArray = (createNewsDto.tags as string).split(',').map(tag => tag.trim());
      }
    }

    const news = this.newsRepository.create({
      title: createNewsDto.title,
      category: createNewsDto.category,
      excerpt: createNewsDto.excerpt || '',
      content: createNewsDto.content,
      author: createNewsDto.author || 'Admin',
      image_url: createNewsDto.image_url,
      published_date: publishedDate,
      status: createNewsDto.status || 'Draft',
      featured: createNewsDto.featured || false,
      tags: tagsArray,
      views: 0,
    });

    return this.newsRepository.save(news);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    category?: string,
    status?: string,
    search?: string,
  ): Promise<{ data: NewsArticle[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.newsRepository.createQueryBuilder('news');
    
    if (category) {
      queryBuilder.andWhere('news.category = :category', { category });
    }
    
    if (status) {
      queryBuilder.andWhere('news.status = :status', { status });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(news.title ILIKE :search OR news.content ILIKE :search OR news.excerpt ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    const [data, total] = await queryBuilder
      .orderBy('news.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<NewsArticle> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News article with ID ${id} not found`);
    }
    return news;
  }

  async findBySlug(slug: string): Promise<NewsArticle> {
    // Generate slug from title (simplified)
    const news = await this.newsRepository.findOne({ 
      where: { title: Like(`%${slug.replace(/-/g, ' ')}%`) }
    });
    
    if (!news) {
      throw new NotFoundException(`News article with slug ${slug} not found`);
    }

    // Increment view count
    news.views += 1;
    await this.newsRepository.save(news);

    return news;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto): Promise<NewsArticle> {
    const news = await this.findOne(id);
    
    // Handle fields one by one
    if (updateNewsDto.title !== undefined) news.title = updateNewsDto.title;
    if (updateNewsDto.category !== undefined) news.category = updateNewsDto.category;
    if (updateNewsDto.excerpt !== undefined) news.excerpt = updateNewsDto.excerpt;
    if (updateNewsDto.content !== undefined) news.content = updateNewsDto.content;
    if (updateNewsDto.author !== undefined) news.author = updateNewsDto.author;
    if (updateNewsDto.image_url !== undefined) news.image_url = updateNewsDto.image_url;
    
    // Handle published_date
    if (updateNewsDto.published_date !== undefined) {
      news.published_date = updateNewsDto.published_date ? new Date(updateNewsDto.published_date) : null;
    }
    
    if (updateNewsDto.status !== undefined) news.status = updateNewsDto.status;
    if (updateNewsDto.featured !== undefined) news.featured = updateNewsDto.featured;
    
    // Handle tags
    if (updateNewsDto.tags !== undefined) {
      if (Array.isArray(updateNewsDto.tags)) {
        news.tags = updateNewsDto.tags;
      } else if (typeof updateNewsDto.tags === 'string') {
        news.tags = (updateNewsDto.tags as string).split(',').map(tag => tag.trim());
      }
    }
    
    return this.newsRepository.save(news);
  }

  async remove(id: string): Promise<void> {
    const news = await this.findOne(id);
    await this.newsRepository.remove(news);
  }

  async getPublished(): Promise<NewsArticle[]> {
    return this.newsRepository.find({
      where: { status: 'Published' },
      order: { published_date: 'DESC', created_at: 'DESC' },
    });
  }

  async getFeatured(): Promise<NewsArticle[]> {
    return this.newsRepository.find({
      where: { featured: true, status: 'Published' },
      order: { published_date: 'DESC' },
      take: 5,
    });
  }

  async getByCategory(category: string): Promise<NewsArticle[]> {
    return this.newsRepository.find({
      where: { category, status: 'Published' },
      order: { published_date: 'DESC' },
    });
  }

  async searchArticles(query: string): Promise<NewsArticle[]> {
    return this.newsRepository.find({
      where: [
        { title: Like(`%${query}%`), status: 'Published' },
        { content: Like(`%${query}%`), status: 'Published' },
        { excerpt: Like(`%${query}%`), status: 'Published' },
      ],
      order: { published_date: 'DESC' },
    });
  }
}