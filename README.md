# Shopora – Software Requirement Specification (SRS)

**Project Name:** Shopora  
**Project Type:** AI-Powered Multi-Vendor E-commerce Platform  
**Industry:** E-commerce & Online Retail  
**Document Type:** Software Requirement Specification  
**Version:** 2.0

# Project Live URL
**Front-End:** https://shopora-ashen.vercel.app

# Github URL
**Front-End:**  https://github.com/foysal41/Shopora
**Backend-End:** https://github.com/foysal41/Shopora-server


---

# 1. Project Overview

## 1.1 Introduction

Shopora is a modern AI-powered multi-vendor e-commerce platform designed to provide a complete online shopping and seller-management experience for customers, sellers, and administrators.

The platform covers product discovery, product management, shopping cart, wishlist, checkout, payment, orders, inventory, coupons, analytics, dashboards, customer support, AI assistance, and seller-focused marketing tools.

The project is structured around three primary user roles:

- Customer
- Seller
- Admin

Each role has dedicated interfaces, workflows, and access permissions.

## 1.2 Project Vision

Shopora aims to provide a smart, secure, scalable, and user-friendly e-commerce ecosystem where:

- Customers can discover, compare, save, and purchase products.
- Sellers can manage products, inventory, orders, coupons, analytics, and marketing activities.
- Administrators can manage users, products, orders, and platform operations.
- AI can assist with product content, recommendations, shopping support, and seller marketing.
- Customers can receive a more personalized shopping experience.
- Sellers can research markets, discover leads, and promote products more efficiently.

## 1.3 Target Users

Shopora is intended for:

- Small and medium-sized businesses
- Individual entrepreneurs
- Small brands
- Online retailers
- E-commerce businesses
- Store administrators and operations teams
- End consumers

---

# 2. Architecture & Design Foundation

## 2.1 Initial Architecture

The platform is organized around a modular architecture separating:

- Public/customer-facing experience
- Seller operations
- Admin operations
- Authentication and authorization
- Product and inventory management
- Shopping and checkout
- Order and payment management
- AI services
- Analytics
- Marketing and lead-generation services

The architecture is designed to keep major features separated into reusable and maintainable application modules.

## 2.2 UI/UX Foundation

The platform follows a responsive and consistent UI/UX approach across customer, seller, and admin experiences.

The design direction includes:

- Responsive layouts for desktop, tablet, and mobile
- Reusable interface components
- Consistent navigation and dashboard structures
- Clear product discovery and purchase flows
- Role-specific dashboard experiences
- Consistent forms, cards, buttons, icons, and feedback states

The project brand direction uses a clean modern visual language with **Teal**, **Coral**, light backgrounds, Slate text, and **Poppins** typography.

---

# 3. Objectives

## 3.1 Customer Objectives

- Provide a simple and convenient shopping experience.
- Search and filter products.
- Browse categories and brands.
- View detailed product information.
- Add and manage cart items.
- Maintain a wishlist.
- Apply coupons.
- Complete checkout and payment.
- View order history and order details.
- Track order status.
- Use AI-powered shopping assistance.
- Receive personalized product recommendations.
- Access customer dashboard features such as coupons, payment methods, account settings, notifications, and support.

## 3.2 Seller Objectives

- Create, edit, and delete products.
- Manage product pricing and stock.
- Manage categories and brands.
- Manage coupons.
- View and manage orders.
- Monitor inventory.
- View analytics and sales information.
- Generate AI-assisted product descriptions.
- Share products using AI-generated promotional content.
- Research Facebook Ads and market information.
- Generate business and social-media leads.
- Discover influencers for product marketing.
- Research customer product reviews and problems.

## 3.3 Admin Objectives

- Manage customers and sellers.
- Manage products.
- Manage categories and brands.
- Manage orders and inventory.
- Manage platform coupons.
- Monitor customer reviews.
- View analytics and reports.
- Manage dashboard notifications.
- Manage platform settings.
- Block or unblock customers.
- Manage customer and product administration routes.

## 3.4 Technical Objectives

- Use PostgreSQL for relational data storage.
- Use Prisma ORM for structured database access.
- Maintain relationships between users, sellers, products, orders, and order items.
- Use protected API requests and role-based access control.
- Provide responsive and reusable UI components.
- Maintain scalable and maintainable project architecture.
- Integrate AI and external data services where required.

---

# 4. User Roles

## 4.1 Customer

Customers can:

- Register and authenticate.
- Browse, search, and filter products.
- View product details.
- Add products to cart.
- Update and remove cart items.
- Add and remove wishlist items.
- Apply coupons.
- Enter checkout information.
- Select payment methods.
- Place orders.
- View order history and details.
- Track order status.
- Use AI recommendations.
- Use AI/customer support assistance.
- Manage dashboard settings and notifications.

## 4.2 Seller

Sellers can:

- Access the seller dashboard.
- Create, edit, and delete products.
- Manage pricing, stock, categories, and brands.
- View products belonging to their store.
- Manage coupons.
- View and manage orders.
- Monitor inventory.
- View analytics.
- Use AI product-content tools.
- Use seller marketing and lead-generation tools.

Each product is associated with its seller.

Relationship:

```text
User/Seller → Product → OrderItem → Order
```

## 4.3 Admin

Admins can:

- Access the admin dashboard.
- Manage users, customers, and sellers.
- Manage products.
- Manage categories and brands.
- Manage orders and inventory.
- Manage coupons.
- Monitor reviews.
- View reports and analytics.
- Manage notifications and settings.
- Block or unblock customers.

---

# 5. Functional Requirements

## 5.1 Authentication & Authorization

The system shall provide:

- User registration
- Login and logout
- Session management
- Role-based access
- Protected frontend routes
- Protected API requests
- Customer, seller, and admin access separation

Roles:

```text
Customer
Seller
Admin
```

---

## 5.2 Product Catalog Management

Products may contain:

- Product ID
- Product name
- SKU
- Short description
- Full description
- Category
- Brand
- Regular price
- Sale price
- Stock quantity
- Low-stock alert
- Stock status
- Product images
- Product status
- Seller information
- Created and updated information

Sellers and administrators shall manage product information according to their permissions.

---

## 5.3 Product Search & Filtering

Customers shall be able to:

- Search by keyword.
- Browse by category.
- Browse by brand.
- Filter by price.
- Filter by availability.
- Use relevant product attributes.

The product experience shall support dynamic product discovery and direct navigation to product details.

---

## 5.4 Shopping Cart

Customers shall be able to:

- Add products.
- Increase or decrease quantity.
- Remove products.
- View subtotal.
- View total amount.
- See dynamic cart count.
- Receive feedback when products are added.

Cart totals shall update when quantities change.

---

## 5.5 Wishlist

Customers shall be able to:

- Add products to wishlist.
- Remove products from wishlist.
- View saved products.
- Move wishlist products to cart where applicable.
- See a dynamic wishlist count.

---

## 5.6 Checkout

Checkout shall support:

- Customer information
- Shipping information
- Product summary
- Quantity
- Subtotal
- Coupon discount
- Final total
- Payment method
- Order creation

The checkout flow shall validate required information before order placement.

---

## 5.7 Payment

The platform is designed to support online payment integration.

Supported/implemented payment flows include:

- Cash on Delivery
- Stripe-based online checkout flow

The payment workflow includes:

1. Checkout initiation
2. Payment session creation
3. Payment/session verification
4. Product and customer metadata handling
5. Paid-order creation
6. Order-item creation

---

## 5.8 Coupon & Discount Management

The system shall provide:

- Seller coupon management
- Customer coupon application
- Discount calculation
- Coupon validation
- Checkout discount integration
- Customer dashboard coupon access

---

## 5.9 Order Management

Customers shall be able to:

- Place orders.
- View order history.
- View order details.
- Track order status.

Sellers shall be able to:

- View orders containing their products.
- Search orders.
- Filter orders by status.
- View customer and shipping information.
- View order items.
- Manage order status.

Admins shall be able to manage platform orders.

---

# 6. Dashboard Requirements

## 6.1 Customer Dashboard

The customer dashboard includes functionality for:

- Customer account information
- Orders
- Coupons
- Payment methods
- Notifications
- Account settings
- AI recommendations
- Customer support

## 6.2 Seller Dashboard

The seller dashboard includes:

- Product management
- Categories
- Brands
- Inventory
- Orders
- Coupons
- Analytics
- AI tools
- Marketing tools
- Lead-generation tools

## 6.3 Admin Dashboard

The admin dashboard includes:

- Customer management
- Product management
- Order management
- User management
- Customer blocking/unblocking
- Reviews
- Analytics
- Notifications
- Platform settings

---

# 7. AI Features

## 7.1 AI Product Description Generator

Sellers can generate product content using AI.

The feature supports:

- Short product descriptions
- Detailed product descriptions
- Product-content assistance

## 7.2 AI Shopping Assistant

The platform provides an AI assistant for customer/product discovery and shopping support.

The interface supports:

- Customer messages
- Assistant responses
- Loading states
- Markdown-formatted responses
- Product-related assistance

## 7.3 AI Product Recommendations

The customer experience includes an AI recommendation area with product filtering.

The recommendation system is intended to help customers discover relevant products.

## 7.4 AI Customer Support

Customer support includes an AI-assisted chat experience with:

- Conversational support
- Quick answers
- Customer assistance

---

# 8. Seller Marketing & Lead Generation

Shopora has been expanded with seller-focused marketing and research capabilities.

## 8.1 AI Product Social Sharing

Sellers can select a product and generate promotional content including:

- Marketing caption
- Promotional hook
- Trend-focused hashtags
- Product sharing content

The generated content can be used for social-media promotion.

## 8.2 Facebook Ads Research

Sellers can research Facebook advertising activity using:

- Facebook Page/Ads Library input
- Advertisement-related research
- Configurable result/run limits

The feature is intended to help sellers perform competitor and market research.

## 8.3 General Marketing Research

Sellers can perform keyword-based research for different data types, including:

- People
- Pages
- Places
- Posts
- Videos

## 8.4 Google Maps Business Leads

Sellers can enter:

- Business-related keywords/query
- Requested lead quantity

The system can retrieve business-lead information for marketing outreach.

## 8.5 Instagram Leads

Sellers can provide:

- Product/category keyword
- Location
- Desired lead quantity

The system supports Instagram-focused lead discovery.

## 8.6 TikTok Email Leads

The platform includes TikTok-focused email lead generation for seller outreach.

## 8.7 Customer Product Research

Customers/sellers can research product-related information from Facebook data, including:

- Product reviews
- Customer feedback
- Product-related problems

This can help identify customer concerns and market feedback.

## 8.8 Influencer Discovery

Sellers can discover potential influencers across:

- Instagram
- YouTube
- TikTok

The purpose is to support product marketing and outreach.

---

# 9. Review & Customer Feedback

The platform supports product review-related functionality.

Requirements include:

- Viewing product reviews.
- Managing review-related data where permitted.
- Using customer feedback as a source for product research.
- Identifying product-related problems from customer feedback.

---

# 10. Deals & Promotional Content

The platform supports promotional experiences including:

- Deals of the Day
- Product promotions
- Coupons
- Discount-related customer experiences
- Product marketing content

---

# 11. Notifications

The dashboard notification system shall support important platform information.

Notification-related functionality includes:

- Dashboard notifications
- Important account updates
- Order-related information
- Platform activity information

The broader project architecture also allows real-time notifications for important order and inventory events.

---

# 12. Non-Functional Requirements

## 12.1 Performance

- Product and dashboard interfaces should load efficiently.
- API requests should be structured and optimized.
- Dynamic data should be fetched only where required.
- Large lists should support appropriate filtering/search behavior.

## 12.2 Security

- Authentication must be required for protected actions.
- Role-based authorization must restrict protected routes.
- Seller product access must respect ownership.
- Sensitive payment operations must be handled server-side.
- Protected API requests should use authenticated access.

## 12.3 Scalability

The system should support future expansion of:

- Product catalog
- Seller accounts
- Customer accounts
- Orders
- AI services
- Marketing tools
- Analytics

## 12.4 Maintainability

The project should use:

- Reusable components
- Modular routes
- Structured API services
- Type-safe development
- Clear role separation
- Consistent UI patterns

## 12.5 Responsiveness

The interface shall be usable across:

- Desktop
- Tablet
- Mobile

---

# 13. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Node.js
- Express.js
- REST APIs

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- Better Auth
- Role-based authorization

## AI

- OpenRouter-based AI integration
- AI product-content generation
- AI recommendations
- AI support/chat experiences

## Payments

- Stripe
- Cash on Delivery

## Real-Time / Platform Services

- Socket.IO architecture for real-time events
- External data and scraping services for marketing research and lead generation

---

# 14. Data Relationships

The core commerce relationship is:

```text
User
 ├── Customer
 ├── Seller
 └── Admin

Seller
 └── Products

Product
 ├── Category
 ├── Brand
 ├── Inventory
 └── OrderItems

Order
 ├── Customer
 ├── OrderItems
 ├── Payment
 └── Shipping Information
```

Seller ownership follows:

```text
User/Seller → Product → OrderItem → Order
```

This allows the platform to identify product ownership and seller-related orders.

---

# 15. System Workflow

## Customer Workflow

```text
Register/Login
      ↓
Browse/Search Products
      ↓
View Product
      ↓
Wishlist / Add to Cart
      ↓
Apply Coupon
      ↓
Checkout
      ↓
Payment
      ↓
Order Created
      ↓
Order Tracking
```

## Seller Workflow

```text
Seller Login
      ↓
Seller Dashboard
      ↓
Create/Manage Products
      ↓
Inventory & Coupons
      ↓
Receive & Manage Orders
      ↓
Analytics
      ↓
AI Tools
      ↓
Marketing Research
      ↓
Lead Generation / Influencer Discovery
      ↓
Product Promotion
```

## Admin Workflow

```text
Admin Login
      ↓
Admin Dashboard
      ↓
Manage Customers & Sellers
      ↓
Manage Products
      ↓
Manage Orders & Inventory
      ↓
Reviews / Notifications
      ↓
Analytics & Platform Operations
```

---

# 16. Implementation Alignment

The current project implementation extends the original SRS in several areas.

### Core E-commerce Implementation

- Authentication and role-based access
- Customer, seller, and admin dashboards
- Product CRUD
- Product ownership
- Categories and brands
- Cart and wishlist
- Coupons and discounts
- Checkout
- Stripe payment verification
- Orders and seller order management
- Seller analytics
- Inventory export
- Search and product discovery

### AI Implementation

- AI short and detailed product descriptions
- AI shopping assistant
- AI product recommendations
- AI-assisted customer support
- AI product-sharing content

### Seller Growth & Marketing Implementation

- Facebook Ads research
- General marketing research
- Google Maps business leads
- Instagram leads
- TikTok email leads
- Customer product research
- Influencer discovery
- AI social-sharing content

### Customer Experience Implementation

- Customer dashboard
- Payment method interface
- Coupons
- Notifications
- Account settings
- Reviews
- Deals of the Day
- AI recommendations
- Customer support

### Admin Operations Implementation

- Customer management
- Customer block/unblock
- Product administration
- Dashboard routes
- Navigation and sidebar behavior

---

# 17. Project Scope Summary

Shopora has evolved from a standard multi-vendor e-commerce concept into a broader AI-assisted commerce platform.

The system combines:

- E-commerce operations
- Customer shopping
- Seller management
- Admin management
- AI assistance
- Payment processing
- Analytics
- Customer support
- Product research
- Marketing research
- Lead generation
- Influencer discovery
- AI-assisted product promotion

The architecture is designed to support future expansion while keeping customer, seller, and admin responsibilities separated.

---

# 18. Conclusion

Shopora – AI-Powered E-commerce Platform provides a complete ecosystem for customers, sellers, and administrators.

The updated requirements cover the original e-commerce foundation as well as the major functionality implemented during project development, including dashboards, authentication, product management, cart and wishlist, checkout, payments, orders, coupons, analytics, AI features, customer support, reviews, notifications, marketing research, lead generation, influencer discovery, and AI-powered product promotion.

The combination of PostgreSQL with Prisma ORM, structured APIs, role-based access, responsive UI, AI services, payment integration, and marketing automation provides a scalable foundation for a modern e-commerce platform.
