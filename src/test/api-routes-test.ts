import { apiService } from '../services/apiService';

export const testApiRoutes = async () => {
  console.log('🧪 Testing API Routes...');
  
  try {
    // Test get repositories
    console.log('1. Testing get repositories...');
    const repositories = await apiService.getRepositories();
    console.log('✅ Get repositories:', repositories);
    
    // Test get analyses
    console.log('2. Testing get analyses...');
    const analyses = await apiService.getAnalyses();
    console.log('✅ Get analyses:', analyses);
    
    // Test cache stats
    console.log('4. Testing cache stats...');
    const cacheStats = apiService.getCacheStats();
    console.log('✅ Cache stats:', cacheStats);
    
    console.log('🎉 All API routes are working correctly!');
    return true;
    
  } catch (error) {
    console.error('❌ API route test failed:', error);
    return false;
  }
};

// Auto-run the test if this file is imported
if (typeof window !== 'undefined') {
  // Run test after a short delay to ensure the API service is initialized
  setTimeout(testApiRoutes, 1000);
}
