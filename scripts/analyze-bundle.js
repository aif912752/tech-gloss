#!/usr/bin/env node

// Bundle analyzer script for performance optimization
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist');
const ASSETS_DIR = join(DIST_DIR, '_astro');

// File size thresholds (in KB)
const THRESHOLDS = {
  JS_WARNING: 100,
  JS_ERROR: 250,
  CSS_WARNING: 50,
  CSS_ERROR: 100,
  IMAGE_WARNING: 500,
  IMAGE_ERROR: 1000,
};

class BundleAnalyzer {
  constructor() {
    this.results = {
      totalSize: 0,
      files: [],
      warnings: [],
      errors: [],
      recommendations: [],
    };
  }

  analyze() {
    console.log('🔍 Analyzing bundle...\n');

    try {
      this.analyzeDirectory(DIST_DIR);
      this.generateReport();
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  analyzeDirectory(dir, relativePath = '') {
    try {
      const items = readdirSync(dir);

      items.forEach(item => {
        const fullPath = join(dir, item);
        const itemRelativePath = join(relativePath, item);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
          this.analyzeDirectory(fullPath, itemRelativePath);
        } else {
          this.analyzeFile(fullPath, itemRelativePath, stats.size);
        }
      });
    } catch (error) {
      console.warn(`⚠️  Could not analyze directory ${dir}:`, error.message);
    }
  }

  analyzeFile(filePath, relativePath, size) {
    const ext = extname(filePath).toLowerCase();
    const sizeKB = size / 1024;

    const fileInfo = {
      path: relativePath,
      size: size,
      sizeKB: Math.round(sizeKB * 100) / 100,
      type: this.getFileType(ext),
      ext: ext,
    };

    this.results.files.push(fileInfo);
    this.results.totalSize += size;

    // Check thresholds
    this.checkThresholds(fileInfo);

    // Analyze specific file types
    if (ext === '.js') {
      this.analyzeJavaScript(filePath, fileInfo);
    } else if (ext === '.css') {
      this.analyzeCSS(filePath, fileInfo);
    }
  }

  getFileType(ext) {
    const types = {
      '.js': 'JavaScript',
      '.css': 'CSS',
      '.html': 'HTML',
      '.png': 'Image',
      '.jpg': 'Image',
      '.jpeg': 'Image',
      '.webp': 'Image',
      '.svg': 'Image',
      '.woff': 'Font',
      '.woff2': 'Font',
      '.ttf': 'Font',
      '.json': 'Data',
    };
    return types[ext] || 'Other';
  }

  checkThresholds(fileInfo) {
    const { sizeKB, type, path } = fileInfo;

    if (type === 'JavaScript') {
      if (sizeKB > THRESHOLDS.JS_ERROR) {
        this.results.errors.push(`❌ Large JS file: ${path} (${sizeKB}KB)`);
        this.results.recommendations.push(`Consider code splitting for ${path}`);
      } else if (sizeKB > THRESHOLDS.JS_WARNING) {
        this.results.warnings.push(`⚠️  Large JS file: ${path} (${sizeKB}KB)`);
      }
    } else if (type === 'CSS') {
      if (sizeKB > THRESHOLDS.CSS_ERROR) {
        this.results.errors.push(`❌ Large CSS file: ${path} (${sizeKB}KB)`);
        this.results.recommendations.push(`Consider removing unused CSS from ${path}`);
      } else if (sizeKB > THRESHOLDS.CSS_WARNING) {
        this.results.warnings.push(`⚠️  Large CSS file: ${path} (${sizeKB}KB)`);
      }
    } else if (type === 'Image') {
      if (sizeKB > THRESHOLDS.IMAGE_ERROR) {
        this.results.errors.push(`❌ Large image: ${path} (${sizeKB}KB)`);
        this.results.recommendations.push(`Optimize image ${path} - consider WebP format`);
      } else if (sizeKB > THRESHOLDS.IMAGE_WARNING) {
        this.results.warnings.push(`⚠️  Large image: ${path} (${sizeKB}KB)`);
      }
    }
  }

  analyzeJavaScript(filePath, fileInfo) {
    try {
      const content = readFileSync(filePath, 'utf8');
      
      // Check for common performance issues
      if (content.includes('console.log') && !content.includes('development')) {
        this.results.warnings.push(`⚠️  Console logs found in ${fileInfo.path}`);
      }

      // Check for large dependencies
      if (content.length > 50000) {
        this.results.recommendations.push(`Consider lazy loading for ${fileInfo.path}`);
      }

      // Check for duplicate code patterns
      const duplicateRegex = /function\s+(\w+)|const\s+(\w+)\s*=/g;
      const matches = content.match(duplicateRegex);
      if (matches && matches.length > 20) {
        this.results.recommendations.push(`Check for code duplication in ${fileInfo.path}`);
      }
    } catch (error) {
      console.warn(`Could not analyze JS file ${filePath}:`, error.message);
    }
  }

  analyzeCSS(filePath, fileInfo) {
    try {
      const content = readFileSync(filePath, 'utf8');
      
      // Check for unused vendor prefixes
      const vendorPrefixes = content.match(/-webkit-|-moz-|-ms-|-o-/g);
      if (vendorPrefixes && vendorPrefixes.length > 10) {
        this.results.recommendations.push(`Consider using autoprefixer for ${fileInfo.path}`);
      }

      // Check for large CSS files
      if (content.length > 30000) {
        this.results.recommendations.push(`Consider splitting CSS in ${fileInfo.path}`);
      }
    } catch (error) {
      console.warn(`Could not analyze CSS file ${filePath}:`, error.message);
    }
  }

  generateReport() {
    const totalSizeMB = Math.round((this.results.totalSize / 1024 / 1024) * 100) / 100;
    
    console.log('📊 Bundle Analysis Report');
    console.log('========================\n');
    
    console.log(`📦 Total bundle size: ${totalSizeMB}MB`);
    console.log(`📁 Total files: ${this.results.files.length}\n`);

    // File type breakdown
    const typeBreakdown = this.getTypeBreakdown();
    console.log('📋 File type breakdown:');
    Object.entries(typeBreakdown).forEach(([type, info]) => {
      const sizeMB = Math.round((info.size / 1024 / 1024) * 100) / 100;
      console.log(`   ${type}: ${info.count} files, ${sizeMB}MB`);
    });
    console.log();

    // Largest files
    const largestFiles = this.results.files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    console.log('🔍 Largest files:');
    largestFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.path} (${file.sizeKB}KB)`);
    });
    console.log();

    // Warnings and errors
    if (this.results.errors.length > 0) {
      console.log('❌ Errors:');
      this.results.errors.forEach(error => console.log(`   ${error}`));
      console.log();
    }

    if (this.results.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.results.warnings.forEach(warning => console.log(`   ${warning}`));
      console.log();
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.results.recommendations.forEach(rec => console.log(`   ${rec}`));
      console.log();
    }

    // Performance score
    const score = this.calculatePerformanceScore();
    console.log(`🎯 Performance Score: ${score}/100`);
    
    if (score < 70) {
      console.log('   Consider optimizing your bundle for better performance');
    } else if (score < 90) {
      console.log('   Good performance, but there\'s room for improvement');
    } else {
      console.log('   Excellent bundle optimization! 🎉');
    }

    // Exit with error code if there are critical issues
    if (this.results.errors.length > 0) {
      process.exit(1);
    }
  }

  getTypeBreakdown() {
    const breakdown = {};
    
    this.results.files.forEach(file => {
      if (!breakdown[file.type]) {
        breakdown[file.type] = { count: 0, size: 0 };
      }
      breakdown[file.type].count++;
      breakdown[file.type].size += file.size;
    });

    return breakdown;
  }

  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points for errors and warnings
    score -= this.results.errors.length * 15;
    score -= this.results.warnings.length * 5;
    
    // Deduct points for large bundle size
    const totalSizeMB = this.results.totalSize / 1024 / 1024;
    if (totalSizeMB > 5) {
      score -= Math.min(30, (totalSizeMB - 5) * 5);
    }
    
    // Deduct points for too many files
    if (this.results.files.length > 50) {
      score -= Math.min(10, (this.results.files.length - 50) * 0.2);
    }
    
    return Math.max(0, Math.round(score));
  }
}

// Run the analyzer
const analyzer = new BundleAnalyzer();
analyzer.analyze();