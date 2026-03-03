import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsResponseDto } from './dto/news-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a news article (Admin only)' })
  @ApiResponse({ status: 201, description: 'News created successfully', type: NewsResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all news articles' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.newsService.findAll(page, limit, category, status, search);
    return {
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / (result.limit || 10))
    };
  }

  @Get('published')
  @Public()
  @ApiOperation({ summary: 'Get all published news (Public)' })
  @ApiResponse({ status: 200, description: 'Return published news', type: [NewsResponseDto] })
  getPublished() {
    return this.newsService.getPublished();
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured news (Public)' })
  @ApiResponse({ status: 200, description: 'Return featured news', type: [NewsResponseDto] })
  getFeatured() {
    return this.newsService.getFeatured();
  }

  @Get('category/:category')
  @Public()
  @ApiOperation({ summary: 'Get news by category (Public)' })
  @ApiParam({ name: 'category', description: 'News category', enum: ['News', 'Updates', 'Features', 'Maintenance', 'Announcements'] })
  @ApiResponse({ status: 200, description: 'Return news by category', type: [NewsResponseDto] })
  getByCategory(@Param('category') category: string) {
    return this.newsService.getByCategory(category);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search news articles (Public)' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Return search results', type: [NewsResponseDto] })
  search(@Query('q') query: string) {
    return this.newsService.searchArticles(query);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get news by slug (Public)' })
  @ApiParam({ name: 'slug', description: 'News slug (URL friendly title)' })
  @ApiResponse({ status: 200, description: 'Return the news article', type: NewsResponseDto })
  @ApiResponse({ status: 404, description: 'News not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get news by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'News ID' })
  @ApiResponse({ status: 200, description: 'Return the news article', type: NewsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'News not found' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a news article (Admin only)' })
  @ApiParam({ name: 'id', description: 'News ID' })
  @ApiResponse({ status: 200, description: 'News updated successfully', type: NewsResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'News not found' })
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a news article (Admin only)' })
  @ApiParam({ name: 'id', description: 'News ID' })
  @ApiResponse({ status: 200, description: 'News deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'News not found' })
  async remove(@Param('id') id: string) {
    await this.newsService.remove(id);
    return { message: 'News article deleted successfully' };
  }
}
