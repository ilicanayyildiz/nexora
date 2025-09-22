/**
 * Security Test Utilities for Nexora NFT Platform
 * Test functions to verify security implementations
 */

import { 
  sanitizeText, 
  sanitizeHtml, 
  sanitizeEmail, 
  validateCollectionData,
  validateNFTData 
} from './security';

/**
 * Test input sanitization
 */
export function testInputSanitization() {
  console.log('🧪 Testing Input Sanitization...');
  
  // Test XSS prevention
  const xssInput = '<script>alert("xss")</script>Hello';
  const sanitized = sanitizeText(xssInput);
  console.log('XSS Test:', sanitized === 'Hello' ? '✅ PASS' : '❌ FAIL');
  
  // Test HTML sanitization
  const htmlInput = '<p>Hello</p><script>alert("xss")</script>';
  const cleanHtml = sanitizeHtml(htmlInput);
  console.log('HTML Sanitization:', cleanHtml === '<p>Hello</p>' ? '✅ PASS' : '❌ FAIL');
  
  // Test email validation
  try {
    const validEmail = sanitizeEmail('test@example.com');
    console.log('Valid Email:', validEmail === 'test@example.com' ? '✅ PASS' : '❌ FAIL');
  } catch {
    console.log('Valid Email:', '❌ FAIL');
  }
  
  try {
    sanitizeEmail('invalid-email');
    console.log('Invalid Email:', '❌ FAIL');
  } catch {
    console.log('Invalid Email:', '✅ PASS');
  }
}

/**
 * Test collection data validation
 */
export function testCollectionValidation() {
  console.log('🧪 Testing Collection Validation...');
  
  // Valid collection
  const validCollection = {
    name: 'My Collection',
    description: 'A great collection',
    mintPrice: '0.1',
    royalty: '5'
  };
  
  const validResult = validateCollectionData(validCollection);
  console.log('Valid Collection:', validResult.valid ? '✅ PASS' : '❌ FAIL');
  
  // Invalid collection (empty name)
  const invalidCollection = {
    name: '',
    description: 'A great collection',
    mintPrice: '0.1',
    royalty: '5'
  };
  
  const invalidResult = validateCollectionData(invalidCollection);
  console.log('Invalid Collection:', !invalidResult.valid ? '✅ PASS' : '❌ FAIL');
  
  // Invalid collection (negative price)
  const negativePriceCollection = {
    name: 'My Collection',
    description: 'A great collection',
    mintPrice: '-0.1',
    royalty: '5'
  };
  
  const negativeResult = validateCollectionData(negativePriceCollection);
  console.log('Negative Price:', !negativeResult.valid ? '✅ PASS' : '❌ FAIL');
}

/**
 * Test NFT data validation
 */
export function testNFTValidation() {
  console.log('🧪 Testing NFT Validation...');
  
  // Valid NFT
  const validNFT = {
    name: 'My NFT',
    description: 'A great NFT',
    imageUrl: 'https://example.com/image.jpg',
    collectionId: '123e4567-e89b-12d3-a456-426614174000'
  };
  
  const validResult = validateNFTData(validNFT);
  console.log('Valid NFT:', validResult.valid ? '✅ PASS' : '❌ FAIL');
  
  // Invalid NFT (empty name)
  const invalidNFT = {
    name: '',
    description: 'A great NFT',
    imageUrl: 'https://example.com/image.jpg',
    collectionId: '123e4567-e89b-12d3-a456-426614174000'
  };
  
  const invalidResult = validateNFTData(invalidNFT);
  console.log('Invalid NFT:', !invalidResult.valid ? '✅ PASS' : '❌ FAIL');
  
  // Invalid NFT (invalid UUID)
  const invalidUUIDNFT = {
    name: 'My NFT',
    description: 'A great NFT',
    imageUrl: 'https://example.com/image.jpg',
    collectionId: 'invalid-uuid'
  };
  
  const invalidUUIDResult = validateNFTData(invalidUUIDNFT);
  console.log('Invalid UUID:', !invalidUUIDResult.valid ? '✅ PASS' : '❌ FAIL');
}

/**
 * Test file upload validation
 */
export function testFileUploadValidation() {
  console.log('🧪 Testing File Upload Validation...');
  
  // Mock file object
  const validFile = {
    name: 'test.jpg',
    size: 1024 * 1024, // 1MB
    type: 'image/jpeg'
  } as File;
  
  const invalidFile = {
    name: 'test.exe',
    size: 1024 * 1024, // 1MB
    type: 'application/x-executable'
  } as File;
  
  // Test valid file
  const validResult = validateFileUpload(validFile, {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['jpg', 'jpeg', 'png']
  });
  
  console.log('Valid File:', validResult.valid ? '✅ PASS' : '❌ FAIL');
  
  // Test invalid file
  const invalidResult = validateFileUpload(invalidFile, {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['jpg', 'jpeg', 'png']
  });
  
  console.log('Invalid File:', !invalidResult.valid ? '✅ PASS' : '❌ FAIL');
}

/**
 * Run all security tests
 */
export function runSecurityTests() {
  console.log('🔒 Running Nexora Security Tests...\n');
  
  testInputSanitization();
  console.log('');
  
  testCollectionValidation();
  console.log('');
  
  testNFTValidation();
  console.log('');
  
  testFileUploadValidation();
  console.log('');
  
  console.log('🔒 Security tests completed!');
}

/**
 * Test CSRF token generation
 */
export function testCSRFGeneration() {
  console.log('🧪 Testing CSRF Token Generation...');
  
  // This would test CSRF token generation in a real environment
  console.log('CSRF Token Test: ⚠️  Requires server environment');
}

/**
 * Test rate limiting
 */
export function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting...');
  
  // This would test rate limiting in a real environment
  console.log('Rate Limiting Test: ⚠️  Requires server environment');
}

// Export for use in development
export default {
  runSecurityTests,
  testInputSanitization,
  testCollectionValidation,
  testNFTValidation,
  testFileUploadValidation,
  testCSRFGeneration,
  testRateLimiting
};
