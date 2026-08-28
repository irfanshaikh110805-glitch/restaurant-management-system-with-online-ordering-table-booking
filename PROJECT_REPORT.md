# RESTAURANT BOOKING AND FOOD PRE-ORDERING WEB APPLICATION

## A Dissertation/Project Report

Submitted in partial fulfillment of the requirements for the award of the degree of

**Bachelor of Computer Applications**

By

**Irfan Shekh**  
**U15KY23S0009**

**Mouiezuddin Killedar**  
**U15KY23S0093**

**Md. Asadullah Mulla**  
**U15KY23S0054**

Under the guidance of

**Mr. Sachin Sutraway**

**Guide, Department of Computer Applications**

---

**Department of Computer Applications**

**Smt Kumudben Darbar College Of Commerce Science And Management Studies**

**Rani Channamma University, Belagavi**

**Karnataka, India**

**Academic Year: 2023-2026**

---


---

## CERTIFICATE FROM INSTITUTE

This is to certify that the project work entitled **"RESTAURANT BOOKING AND FOOD PRE-ORDERING WEB APPLICATION"** is a bonafide work carried out by **Irfan Shekh (U15KY23S0009)**, **Mouiezuddin Killedar (U15KY23S0093)**, and **Md. Asadullah Mulla (U15KY23S0009)** in partial fulfillment of the requirements for the award of the degree of **Bachelor of Computer Applications** from Rani Channamma University, Belagavi, during the academic year 2023-2026.

The project has been carried out under my guidance and supervision at Smt Kumudben Darbar College Of Commerce Science And Management Studies.

**Guide Name:** Mr. Sachin Sutraway  
**Designation:** Guide, Department of Computer Applications  
**Signature:** _______________  
**Date:** _______________

**Head of Department**  
**Name:** _______________  
**Department:** Computer Applications  
**Signature:** _______________  
**Date:** _______________

**Principal**  
**Name:** _______________  
**Smt Kumudben Darbar College**  
**Signature:** _______________  
**Date:** _______________

**External Examiner**  
**Name:** _______________  
**Signature:** _______________  
**Date:** _______________

---

## DECLARATION

We, **Irfan Shekh (U15KY23S0009)**, **Mouiezuddin Killedar (U15KY23S0093)**, and **Md. Asadullah Mulla (U15KY23S0009)**, hereby declare that the project work entitled **"RESTAURANT BOOKING AND FOOD PRE-ORDERING WEB APPLICATION"** submitted to Rani Channamma University, Belagavi, in partial fulfillment of the requirements for the award of the degree of **Bachelor of Computer Applications** is a record of original work done by us under the guidance of **Mr. Sachin Sutraway**, Guide, Department of Computer Applications, Smt Kumudben Darbar College Of Commerce Science And Management Studies.

We further declare that this project work has not been submitted to any other University or Institution for the award of any degree or diploma.

**Place:** Belagavi  
**Date:** _______________

**Signature of the Students:**

1. _______________  
   **Irfan Shekh**  
   **U15KY23S0009**

2. _______________  
   **Mouiezuddin Killedar**  
   **U15KY23S0093**

3. _______________  
   **Md. Asadullah Mulla**  
   **U15KY23S0009**

---

## ACKNOWLEDGEMENT

We take this opportunity to express our profound gratitude and deep regards to our guide **Mr. Sachin Sutraway**, Guide, Department of Computer Applications, for his exemplary guidance, monitoring, and constant encouragement throughout the course of this project. The blessing, help, and guidance given by him time to time shall carry us a long way in the journey of life on which we are about to embark.

We are obliged to the **Head of the Department of Computer Applications**, Smt Kumudben Darbar College Of Commerce Science And Management Studies, for providing necessary facilities and support during the project work. We also express our sincere gratitude to all the faculty members of the Department of Computer Applications for their valuable suggestions and constructive criticism during the project review sessions.

We are grateful to the **Principal** and the **Management** of Smt Kumudben Darbar College Of Commerce Science And Management Studies for providing excellent infrastructure and conducive environment for learning and research.

We would like to extend our sincere thanks to our families and friends for their continuous support, encouragement, and understanding throughout this endeavor. Their patience and motivation have been instrumental in the successful completion of this project.

We also acknowledge the support of our fellow students who provided valuable feedback during the development and testing phases of the project.

Finally, we thank the Almighty for giving us the strength, knowledge, and opportunity to undertake this project and complete it satisfactorily.

**Irfan Shekh (U15KY23S0009)**  
**Mouiezuddin Killedar (U15KY23S0093)**  
**Md. Asadullah Mulla (U15KY23S0009)**

---


## TABLE OF CONTENTS

| Chapter | Title | Page No. |
|---------|-------|----------|
| | **List of Figures** | |
| | **List of Tables** | |
| | **Abbreviations** | |
| **1** | **INTRODUCTION** | |
| 1.1 | System Introduction | |
| 1.2 | Background | |
| 1.3 | Objectives | |
| 1.4 | Scope of the Project | |
| 1.5 | System Structure | |
| 1.6 | System Architecture | |
| 1.7 | End Users | |
| 1.8 | Software and Hardware Requirements | |
| **2** | **SOFTWARE REQUIREMENT SPECIFICATION (SRS)** | |
| 2.1 | Introduction | |
| 2.2 | Overall Description | |
| 2.2.1 | Product Perspective | |
| 2.2.2 | Product Functions | |
| 2.2.3 | User Characteristics | |
| 2.2.4 | Constraints | |
| 2.2.5 | Assumptions and Dependencies | |
| 2.3 | Functional Requirements | |
| 2.4 | Design Constraints | |
| 2.5 | System Attributes | |
| 2.6 | Other Requirements | |
| **3** | **SYSTEM DESIGN** | |
| 3.1 | Introduction | |
| 3.2 | Assumptions and Constraints | |
| 3.3 | Functional Decomposition | |
| 3.4 | System Diagrams | |
| 3.4.1 | Context Flow Diagram (CFD) | |
| 3.4.2 | Data Flow Diagram Level 0 | |
| 3.4.3 | Data Flow Diagram Level 1 | |
| 3.4.4 | Data Flow Diagram Level 2 | |
| 3.5 | Component Description | |
| **4** | **DATABASE DESIGN** | |
| 4.1 | Introduction | |
| 4.2 | Purpose and Scope | |
| 4.3 | Table Definitions | |
| 4.4 | Entity Relationship Diagram | |
| **5** | **DETAILED DESIGN** | |
| 5.1 | Structure Chart | |
| 5.2 | Module-wise Design | |
| 5.2.1 | User Authentication Module | |
| 5.2.2 | Menu Management Module | |
| 5.2.3 | Order Management Module | |
| 5.2.4 | Booking Management Module | |
| 5.2.5 | Payment Processing Module | |
| 5.2.6 | Loyalty Program Module | |
| 5.2.7 | Admin Dashboard Module | |
| **6** | **IMPLEMENTATION ASPECTS** | |
| 6.1 | Deployment Setup | |
| 6.2 | Platform Details | |
| 6.3 | Performance Considerations | |
| 6.4 | Security Implementation | |
| **7** | **PROGRAM CODE** | |
| 7.1 | Database Connection | |
| 7.2 | Authentication Functions | |
| 7.3 | CRUD Operations | |
| 7.4 | Validation Functions | |
| 7.5 | Search and Filter Functions | |
| 7.6 | Payment Integration | |
| **8** | **USER INTERFACE** | |
| 8.1 | Login and Registration Pages | |
| 8.2 | Home Page | |
| 8.3 | Menu Browsing Interface | |
| 8.4 | Shopping Cart Interface | |
| 8.5 | Booking Interface | |
| 8.6 | Order Tracking Interface | |
| 8.7 | Admin Dashboard | |
| 8.8 | Error Handling and Alerts | |
| **9** | **TESTING** | |
| 9.1 | Introduction to Testing | |
| 9.2 | Unit Testing | |
| 9.3 | Integration Testing | |
| 9.4 | System Testing | |
| 9.5 | Test Cases and Results | |
| **10** | **CONCLUSION** | |
| 10.1 | Conclusion | |
| 10.2 | Limitations | |
| 10.3 | Future Scope | |
| | **BIBLIOGRAPHY / REFERENCES** | |

---


## LIST OF FIGURES

| Figure No. | Title | Page No. |
|------------|-------|----------|
| 1.1 | System Architecture Diagram | |
| 1.2 | Technology Stack Overview | |
| 3.1 | Context Flow Diagram | |
| 3.2 | Data Flow Diagram Level 0 | |
| 3.3 | Data Flow Diagram Level 1 - User Module | |
| 3.4 | Data Flow Diagram Level 1 - Admin Module | |
| 3.5 | Data Flow Diagram Level 2 - Order Processing | |
| 3.6 | Component Interaction Diagram | |
| 4.1 | Entity Relationship Diagram | |
| 4.2 | Database Schema Overview | |
| 5.1 | Structure Chart - Overall System | |
| 5.2 | Module Interaction Flow | |
| 8.1 | Login Page Screenshot | |
| 8.2 | Home Page Screenshot | |
| 8.3 | Menu Page Screenshot | |
| 8.4 | Shopping Cart Screenshot | |
| 8.5 | Booking Page Screenshot | |
| 8.6 | Order Tracking Screenshot | |
| 8.7 | Admin Dashboard Screenshot | |
| 8.8 | Mobile Responsive View | |

---

## LIST OF TABLES

| Table No. | Title | Page No. |
|-----------|-------|----------|
| 1.1 | Software Requirements | |
| 1.2 | Hardware Requirements | |
| 2.1 | Functional Requirements Summary | |
| 2.2 | Non-Functional Requirements | |
| 4.1 | Profiles Table Structure | |
| 4.2 | Menu Categories Table Structure | |
| 4.3 | Menu Items Table Structure | |
| 4.4 | Orders Table Structure | |
| 4.5 | Order Items Table Structure | |
| 4.6 | Bookings Table Structure | |
| 4.7 | Payments Table Structure | |
| 4.8 | Reviews Table Structure | |
| 9.1 | Unit Test Cases | |
| 9.2 | Integration Test Cases | |
| 9.3 | System Test Cases | |
| 9.4 | Performance Test Results | |

---


## ABBREVIATIONS

| Abbreviation | Full Form |
|--------------|-----------|
| API | Application Programming Interface |
| BaaS | Backend as a Service |
| CRUD | Create, Read, Update, Delete |
| CSS | Cascading Style Sheets |
| DOM | Document Object Model |
| ER | Entity Relationship |
| HMR | Hot Module Replacement |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| HTTPS | HyperText Transfer Protocol Secure |
| JS | JavaScript |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| OWASP | Open Web Application Security Project |
| PWA | Progressive Web App |
| REST | Representational State Transfer |
| RLS | Row Level Security |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| SRS | Software Requirement Specification |
| UI | User Interface |
| UPI | Unified Payments Interface |
| URL | Uniform Resource Locator |
| UX | User Experience |
| UUID | Universally Unique Identifier |
| WCAG | Web Content Accessibility Guidelines |
| XSS | Cross-Site Scripting |

---

## 1.1 System Introduction

The Restaurant Booking and Food Pre-Ordering Web Application (branded as "Spice Haven") is a comprehensive web-based solution designed to revolutionize the way restaurants interact with their customers and manage their operations. This modern, production-ready system provides end-to-end functionality for online food ordering, table reservations, real-time order tracking, loyalty programs, and complete restaurant administration.

In today's digital age, customers expect convenience, speed, and transparency in their dining experiences. Traditional restaurant operations often struggle with manual order taking, inefficient table management, and lack of customer engagement tools. The Restaurant Booking and Food Pre-Ordering Web Application addresses these challenges by providing a unified platform that seamlessly connects customers with restaurant services through an intuitive web interface.

The system is built using cutting-edge web technologies including React 18 for the frontend, Vite as the build tool for lightning-fast development, and Supabase as the backend-as-a-service platform. This technology stack ensures high performance, scalability, and maintainability while reducing development complexity and infrastructure costs.

The application serves two primary user groups: customers who can browse menus, place orders, make reservations, and track their orders in real-time; and administrators who can manage menus, process orders, handle bookings, monitor inventory, and analyze business performance through comprehensive dashboards. The system also includes advanced features such as a multi-tier loyalty program, promotional campaigns, review and rating systems, and integrated payment processing.

**Project Team:**
- Irfan Shekh (U15KY23S0009)
- Mouiezuddin Killedar (U15KY23S0093)
- Md. Asadullah Mulla (U15KY23S0009)

**Institution:** Smt Kumudben Darbar College Of Commerce Science And Management Studies  
**University:** Rani Channamma University, Belagavi  
**Guide:** Mr. Sachin Sutraway
The system is built using cutting-edge web technologies including React 18 for the frontend, Vite as the build tool for lightning-fast development, and Supabase as the backend-as-a-service platform. This technology stack ensures high performance, scalability, and maintainability while reducing development complexity and infrastructure costs.

The application serves two primary user groups: customers who can browse menus, place orders, make reservations, and track their orders in real-time; and administrators who can manage menus, process orders, handle bookings, monitor inventory, and analyze business performance through comprehensive dashboards. The system also includes advanced features such as a multi-tier loyalty program, promotional campaigns, review and rating systems, and integrated payment processing.

## 1.2 Background

### 1.2.1 Industry Context

The restaurant industry has undergone significant digital transformation in recent years, accelerated by changing consumer preferences and the global pandemic. Customers increasingly prefer online ordering and contactless services, while restaurants seek efficient tools to manage operations and enhance customer engagement. According to industry reports, online food ordering has grown exponentially, with customers valuing convenience, real-time updates, and personalized experiences.

Traditional restaurant management systems often suffer from several limitations including high costs, complex implementations, lack of integration between different modules, poor user experience, and limited scalability. Many existing solutions are either too basic, offering only menu display and order placement, or too complex and expensive for small to medium-sized restaurants.

### 1.2.3 Need for the New System

The Restaurant Booking and Food Pre-Ordering Web Application was developed to address the gaps in existing solutions by providing:

1. **Comprehensive Functionality:** A complete solution covering online food pre-ordering, table booking, order tracking, loyalty programs, and admin management in a single integrated platform.

2. **Cost-Effectiveness:** Built using modern open-source technologies and cloud-based infrastructure, significantly reducing development and operational costs compared to traditional enterprise systems.

3. **User-Centric Design:** Intuitive interfaces for both customers and administrators, ensuring ease of use without extensive training.

4. **Real-Time Capabilities:** Live order tracking, instant notifications, and real-time inventory updates enhance customer experience and operational efficiency.

5. **Scalability:** Cloud-based architecture allows the system to handle growing user bases and transaction volumes without performance degradation.

6. **Data Ownership:** Restaurants maintain complete control over their customer data, menu information, and business analytics.

7. **Mobile-First Approach:** Responsive design ensures optimal experience across all devices, with Progressive Web App capabilities for app-like functionality without app store dependencies.

## 1.3 Objectives

The primary objectives of the Restaurant Booking and Food Pre-Ordering Web Application are:

### 1.3.1 Primary Objectives

1. **Streamline Online Food Pre-Ordering Process:** Develop an intuitive interface that allows customers to browse menus, pre-order food for specific times, customize orders, and complete purchases efficiently with minimal steps.

2. **Automate Table Booking Management:** Implement a reservation system that enables customers to book tables online while providing administrators with tools to manage capacity, approve bookings, and optimize table allocation.

3. **Enable Real-Time Order Tracking:** Provide customers with live updates on their order status from placement through preparation to delivery, enhancing transparency and reducing customer inquiries.

4. **Centralize Restaurant Operations:** Create a unified admin dashboard that consolidates menu management, order processing, booking oversight, inventory tracking, and business analytics in one place.

5. **Enhance Customer Engagement:** Implement loyalty programs, promotional campaigns, and review systems to build customer relationships and encourage repeat business.

6. **Demonstrate Academic Learning:** Apply theoretical knowledge of web development, database management, software engineering, and project management gained during the Bachelor of Computer Applications program.app store dependencies.

## 1.3 Objectives

The primary objectives of the Spice Haven Restaurant Management System are:

### 1.3.1 Primary Objectives

1. **Streamline Online Ordering Process:** Develop an intuitive interface that allows customers to browse menus, customize orders, and complete purchases efficiently with minimal steps.

2. **Automate Table Booking Management:** Implement a reservation system that enables customers to book tables online while providing administrators with tools to manage capacity, approve bookings, and optimize table allocation.

3. **Enable Real-Time Order Tracking:** Provide customers with live updates on their order status from placement through preparation to delivery, enhancing transparency and reducing customer inquiries.

4. **Centralize Restaurant Operations:** Create a unified admin dashboard that consolidates menu management, order processing, booking oversight, inventory tracking, and business analytics in one place.

5. **Enhance Customer Engagement:** Implement loyalty programs, promotional campaigns, and review systems to build customer relationships and encourage repeat business.

### 1.3.2 Secondary Objectives

1. **Ensure Data Security:** Implement robust authentication, authorization, and data protection mechanisms following industry best practices and OWASP guidelines.

2. **Optimize Performance:** Achieve fast load times, smooth interactions, and efficient resource utilization through code optimization, lazy loading, and caching strategies.

3. **Provide Scalability:** Design the system architecture to handle increasing user loads and data volumes without requiring major restructuring.

4. **Enable Business Intelligence:** Offer comprehensive analytics and reporting tools that help restaurant management make data-driven decisions.

5. **Support Multiple Payment Methods:** Integrate various payment options including online payments, cash on delivery, and pay-at-restaurant to accommodate customer preferences.

6. **Ensure Accessibility:** Design interfaces that are usable by people with diverse abilities, following web accessibility standards.

## 1.4 Scope of the Project

### 1.4.1 Functional Scope

The Spice Haven system encompasses the following functional areas:

**Customer-Facing Features:**
- User registration and authentication with profile management
- Dynamic menu browsing with category filters, search, and dietary preference indicators
- Shopping cart with quantity management and real-time price calculations
- Multiple payment method support including Razorpay integration
- Table booking with date/time selection and special request handling
- Real-time order tracking with visual progress indicators
- Order history and reordering capabilities
- Multi-tier loyalty program with points earning and redemption
- Referral system for customer acquisition
- Review and rating system for menu items and overall experience
- Promotional offers and discount code application
- Real-time notifications for order updates and promotions
- User settings for account, delivery addresses, and preferences

**Administrative Features:**
- Secure admin authentication and role-based access control
- Comprehensive dashboard with key performance indicators and analytics
- Menu management including CRUD operations for items and categories
- Order management with status updates and payment tracking
- Booking management with approval/rejection and table allocation
- Inventory management with stock tracking and low-stock alerts
- Promotion management for creating and monitoring campaigns
- Review moderation for approving and featuring customer feedback
- User management for viewing customer profiles and activity
- Business analytics with charts and trend analysis

### 1.4.2 Technical Scope

The project covers the following technical aspects:

**Frontend Development:**
- Single Page Application (SPA) architecture using React 18
- Component-based design with reusable UI elements
- State management using Context API and custom hooks
- Responsive design for mobile, tablet, and desktop devices
- Progressive Web App implementation with offline capabilities
- Performance optimization through code splitting and lazy loading

**Backend Integration:**
- Supabase Backend-as-a-Service integration
- PostgreSQL database with Row Level Security policies
- Real-time subscriptions for live updates
- RESTful API communication
- File storage for images and documents

**Security Implementation:**
- Input sanitization and validation
- XSS and SQL injection protection
- Rate limiting and suspicious activity detection
- Secure session management
- Content Security Policy headers

**Deployment and DevOps:**
- Continuous Integration/Continuous Deployment (CI/CD) pipeline
- Docker containerization
- Cloud hosting on Netlify/Vercel
- Performance monitoring and error tracking

### 1.4.3 Limitations and Exclusions

The following are outside the scope of this project:

1. **Native Mobile Applications:** The system is web-based with PWA capabilities but does not include native iOS or Android applications.

2. **Kitchen Display System:** While order management is included, a dedicated kitchen display system for real-time order preparation tracking is not implemented.

3. **Point of Sale (POS) Hardware Integration:** The system does not integrate with physical POS terminals, receipt printers, or cash registers.

4. **Multi-Location Management:** The current version supports single restaurant operations; multi-branch management is not included.

5. **Advanced Inventory Forecasting:** Basic inventory tracking is provided, but predictive analytics for stock forecasting is not implemented.

6. **Third-Party Delivery Integration:** The system manages in-house delivery but does not integrate with external delivery services like Uber Eats or DoorDash.

## 1.5 System Structure

The Spice Haven system follows a modern three-tier architecture consisting of the presentation layer, application layer, and data layer. This structure ensures separation of concerns, maintainability, and scalability.

### 1.5.1 Presentation Layer

The presentation layer is responsible for user interaction and display. It consists of:

**Customer Interface Components:**
- Navigation bar with menu links and user account access
- Home page with featured items and promotional banners
- Menu browsing interface with filters and search
- Shopping cart with item management
- Checkout and payment interface
- Booking form with date/time pickers
- Order tracking dashboard
- User profile and settings pages
- Loyalty program interface
- Review submission forms

**Admin Interface Components:**
- Admin dashboard with analytics widgets
- Menu management interface with CRUD forms
- Order management table with status controls
- Booking management calendar view
- Inventory management interface
- Promotion creation and monitoring tools
- Review moderation interface
- User management tables

**Common Components:**
- Authentication forms (login, registration)
- Modal dialogs for confirmations
- Toast notifications for feedback
- Loading spinners and skeleton screens
- Error boundaries for graceful error handling
- Footer with links and information

### 1.5.2 Application Layer

The application layer contains business logic and state management:

**Context Providers:**
- AuthContext: Manages user authentication state and session
- CartContext: Handles shopping cart operations and persistence
- NotificationContext: Manages real-time notifications
- LoyaltyContext: Handles loyalty points and tier calculations
- DeliveryContext: Manages delivery tracking and location
- ThemeContext: Controls dark/light mode preferences

**Custom Hooks:**
- useLocalStorage: Persists data in browser storage
- useDebounce: Optimizes search and filter operations
- usePageTracking: Tracks page views for analytics
- useSEO: Manages meta tags for search engine optimization

**Utility Functions:**
- Input validation and sanitization
- Date and time formatting
- Price calculations and currency formatting
- Error handling and logging
- Analytics tracking
- Payment gateway integration
- Image optimization and lazy loading

### 1.5.3 Data Layer

The data layer manages data persistence and retrieval:

**Database Tables:**
- profiles: User account information
- menu_categories: Menu category definitions
- menu_items: Menu item details with pricing and availability
- orders: Order header information
- order_items: Individual items within orders
- bookings: Table reservation records
- payments: Payment transaction records
- reviews: Customer feedback and ratings
- loyalty_points: Points earning and redemption history
- promotions: Promotional campaign definitions

**Data Access Patterns:**
- Supabase client for database operations
- Row Level Security for data access control
- Real-time subscriptions for live updates
- Optimistic UI updates for better user experience
- Caching strategies for frequently accessed data

## 1.6 System Architecture

The Spice Haven system employs a modern, cloud-based architecture that emphasizes performance, security, and scalability. The architecture can be visualized as follows:

### 1.6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │      │
│  │   Browser    │  │   Browser    │  │   Browser    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   CDN / HOSTING LAYER                        │
│              (Netlify / Vercel / Nginx)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Static Assets (HTML, CSS, JS, Images)              │   │
│  │  Service Worker for Offline Support                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           React 18 Application                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │  Customer  │  │   Admin    │  │   Shared   │    │   │
│  │  │  Modules   │  │  Modules   │  │ Components │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │      State Management (Context API)        │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API / Real-time
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND LAYER (Supabase)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication Service (JWT-based)                  │   │
│  │  PostgreSQL Database with RLS                        │   │
│  │  Real-time Subscriptions                             │   │
│  │  Storage Service (Images)                            │   │
│  │  Edge Functions (Serverless)                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Razorpay   │  │    Leaflet   │  │   Analytics  │      │
│  │   Payment    │  │     Maps     │  │   Services   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.6.2 Component Architecture

The application follows a component-based architecture where each feature is broken down into reusable, self-contained components:

**Page Components:** Top-level components representing entire pages (Home, Menu, Cart, Booking, etc.)

**Feature Components:** Components implementing specific features (MenuFilters, OrderTracking, LoyaltyCard, etc.)

**UI Components:** Reusable interface elements (Button, Modal, Badge, LoadingSpinner, etc.)

**Layout Components:** Structural components (Navbar, Footer, MobileBottomNav, etc.)

### 1.6.3 Data Flow Architecture

The system implements unidirectional data flow:

1. **User Action:** User interacts with UI component (e.g., adds item to cart)
2. **Event Handler:** Component calls appropriate function from Context or utility
3. **State Update:** Context updates application state
4. **API Call:** If needed, data is sent to Supabase backend
5. **Database Operation:** Supabase processes request with RLS checks
6. **Response:** Backend returns success/error response
7. **State Sync:** Application state is updated with response
8. **UI Update:** React re-renders affected components
9. **User Feedback:** User sees updated UI and receives notification

### 1.6.4 Security Architecture

Security is implemented at multiple layers:

**Client-Side Security:**
- Input validation and sanitization
- XSS protection through React's built-in escaping
- Content Security Policy headers
- Secure storage of sensitive data
- Rate limiting on API calls

**Backend Security:**
- Row Level Security (RLS) policies on all tables
- JWT-based authentication
- Secure password hashing
- API rate limiting
- SQL injection prevention through parameterized queries

**Network Security:**
- HTTPS enforcement
- CORS configuration
- Secure cookie settings
- API key protection

## 1.7 End Users

The Spice Haven system is designed to serve multiple user categories, each with distinct needs and access levels:

### 1.7.1 Customers (Primary Users)

**Profile:** General public including individuals, families, and groups looking to order food online or make restaurant reservations.

**Characteristics:**
- Age range: 18-65 years
- Varying levels of technical proficiency
- Access system primarily through mobile devices (60-70%) and desktops (30-40%)
- Expect fast, intuitive interfaces
- Value convenience and real-time information

**Usage Patterns:**
- Browse menu during meal times (lunch: 12-2 PM, dinner: 7-10 PM)
- Place orders for delivery or pickup
- Make advance reservations for special occasions
- Track order status in real-time
- Participate in loyalty programs
- Leave reviews and ratings

**Key Requirements:**
- Easy navigation and search
- Clear menu information with images
- Simple checkout process
- Multiple payment options
- Real-time order updates
- Responsive mobile interface

### 1.7.2 Restaurant Administrators

**Profile:** Restaurant managers, owners, and authorized staff responsible for managing operations.

**Characteristics:**
- Age range: 25-55 years
- Moderate to high technical proficiency
- Access system from office computers and tablets
- Need comprehensive control over all aspects
- Require detailed analytics and reports

**Usage Patterns:**
- Monitor incoming orders throughout business hours
- Update menu items and pricing
- Manage table bookings and capacity
- Process refunds and handle customer issues
- Review business performance metrics
- Moderate customer reviews
- Create promotional campaigns

**Key Requirements:**
- Comprehensive dashboard with real-time data
- Efficient order and booking management tools
- Inventory tracking capabilities
- Analytics and reporting features
- User management functionality
- Secure access controls

### 1.7.3 Restaurant Staff (Kitchen/Delivery)

**Profile:** Kitchen staff and delivery personnel who execute orders.

**Characteristics:**
- Age range: 20-45 years
- Basic to moderate technical proficiency
- Access system through tablets or mobile devices
- Need simple, task-focused interfaces
- Work in fast-paced environments

**Usage Patterns:**
- View incoming orders
- Update order preparation status
- Mark orders as ready for delivery
- Update delivery status and location

**Key Requirements:**
- Simple, clear order displays
- Easy status update mechanisms
- Minimal navigation complexity
- Large, touch-friendly buttons

### 1.7.4 System Administrators

**Profile:** Technical personnel responsible for system maintenance and configuration.

**Characteristics:**
- High technical proficiency
- Access to backend systems and databases
- Responsible for system uptime and performance
- Handle technical issues and bugs

**Usage Patterns:**
- Monitor system performance
- Manage database backups
- Configure system settings
- Troubleshoot technical issues
- Deploy updates and patches

**Key Requirements:**
- Access to logs and monitoring tools
- Database management capabilities
- System configuration options
- Error tracking and debugging tools

## 1.8 Software and Hardware Requirements

### 1.8.1 Development Environment Requirements

**Software Requirements:**

| Component | Specification | Purpose |
|-----------|--------------|---------|
| Operating System | Windows 10/11, macOS 10.15+, Ubuntu 20.04+ | Development platform |
| Node.js | Version 18.x or higher (LTS) | JavaScript runtime |
| npm/yarn | npm 9+ or yarn 1.22+ | Package management |
| Git | Version 2.30+ | Version control |
| Code Editor | VS Code, WebStorm, or similar | Development IDE |
| Web Browser | Chrome 90+, Firefox 88+, Safari 14+ | Testing and debugging |
| Supabase CLI | Latest version | Database management |
| Docker | Version 20.10+ (optional) | Containerization |

**Hardware Requirements:**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | Intel Core i3 / AMD Ryzen 3 | Intel Core i5 / AMD Ryzen 5 or higher |
| RAM | 8 GB | 16 GB or higher |
| Storage | 256 GB SSD | 512 GB SSD or higher |
| Display | 1366 x 768 | 1920 x 1080 or higher |
| Internet | 10 Mbps | 50 Mbps or higher |

### 1.8.2 Production Environment Requirements

**Server Requirements:**

| Component | Specification |
|-----------|--------------|
| Hosting Platform | Netlify, Vercel, or similar CDN-based hosting |
| Node.js Runtime | Version 18.x or higher |
| SSL Certificate | Required (provided by hosting platform) |
| CDN | Global content delivery network |
| Backup Storage | Automated daily backups |

**Database Requirements:**

| Component | Specification |
|-----------|--------------|
| Database System | PostgreSQL 14+ (via Supabase) |
| Storage | Minimum 10 GB, scalable |
| Backup | Automated point-in-time recovery |
| Connections | Support for 100+ concurrent connections |

**Third-Party Services:**

| Service | Purpose | Requirement |
|---------|---------|-------------|
| Supabase | Backend-as-a-Service | Free tier or paid plan |
| Razorpay | Payment processing | Business account with API keys |
| Leaflet/OpenStreetMap | Maps and location | Free, no API key required |
| Netlify/Vercel | Hosting and deployment | Free tier or paid plan |

### 1.8.3 Client-Side Requirements

**End User Device Requirements:**

**Desktop/Laptop:**
- Operating System: Windows 7+, macOS 10.12+, Linux (any modern distribution)
- Browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Screen Resolution: Minimum 1024 x 768
- Internet Connection: Minimum 2 Mbps

**Mobile Devices:**
- Operating System: iOS 12+, Android 8.0+
- Browser: Safari (iOS), Chrome (Android)
- Screen Size: Minimum 4.7 inches
- Internet Connection: 3G or higher (4G/5G recommended)

**Tablet Devices:**
- Operating System: iOS 12+, Android 8.0+
- Browser: Safari (iOS), Chrome (Android)
- Screen Size: 7 inches or larger
- Internet Connection: WiFi or 4G/5G

### 1.8.4 Technology Stack

**Frontend Technologies:**
- React 18.2 - UI library
- React Router DOM v6 - Client-side routing
- Vite 7.3 - Build tool and development server
- Framer Motion 12 - Animation library
- React Icons 5.0 - Icon library
- React Hot Toast 2.4 - Notification system
- date-fns 3.3 - Date manipulation
- Recharts 2.10 - Data visualization
- Leaflet 1.9 - Interactive maps
- Swiper 12.1 - Touch slider

**Backend Technologies:**
- Supabase 2.39 - Backend-as-a-Service
- PostgreSQL 14+ - Relational database
- PostgREST - RESTful API
- GoTrue - Authentication service

**Development Tools:**
- ESLint 10.0 - Code linting
- Prettier 3.2 - Code formatting
- Vite Plugin React 4.2 - React integration
- Sharp 0.34 - Image optimization
- Terser 5.36 - JavaScript minification

**Deployment Tools:**
- Docker 20.10+ - Containerization
- Docker Compose - Multi-container orchestration
- Netlify CLI - Deployment automation
- GitHub Actions - CI/CD pipeline

---


# CHAPTER 2: SOFTWARE REQUIREMENT SPECIFICATION (SRS)

## 2.1 Introduction

The Software Requirement Specification (SRS) document provides a comprehensive description of the Spice Haven Restaurant Management System. This document serves as a contract between the development team and stakeholders, defining what the system will do, how it will perform, and under what constraints it will operate. The SRS follows IEEE standards and includes functional requirements, non-functional requirements, system constraints, and assumptions.

### 2.1.1 Purpose

The purpose of this SRS document is to:
- Provide a detailed description of the system's functionality
- Define system interfaces and interactions
- Specify performance requirements and constraints
- Establish a baseline for validation and verification
- Serve as a reference for developers, testers, and stakeholders
- Document assumptions and dependencies

### 2.1.2 Scope

This SRS covers all aspects of the Spice Haven system including customer-facing features, administrative functions, database design, security requirements, and performance specifications. It applies to the web-based application accessible through modern browsers on desktop, tablet, and mobile devices.

### 2.1.3 Definitions and Acronyms

Refer to the Abbreviations section at the beginning of this document for technical terms and acronyms used throughout this SRS.

## 2.2 Overall Description

### 2.2.1 Product Perspective

The Spice Haven Restaurant Management System is a standalone web application that operates independently while integrating with external services for specific functionalities. The system exists within the following context:

**System Interfaces:**

The application interfaces with several external systems:

1. **Supabase Backend:** The system communicates with Supabase for all backend operations including authentication, database access, real-time updates, and file storage. Communication occurs over HTTPS using RESTful APIs and WebSocket connections for real-time features.

2. **Payment Gateway (Razorpay):** For processing online payments, the system integrates with Razorpay's payment gateway. The integration uses Razorpay's JavaScript SDK and server-side APIs for secure payment processing.

3. **Map Services (Leaflet/OpenStreetMap):** For displaying delivery locations and restaurant location, the system uses Leaflet library with OpenStreetMap tiles. This provides interactive maps without requiring API keys.

4. **Email Service:** Email notifications for order confirmations, booking confirmations, and password resets are sent through Supabase's email service.

5. **Analytics Services:** Optional integration with Google Analytics or similar services for tracking user behavior and system usage patterns.

**User Interfaces:**

The system provides responsive web interfaces optimized for:
- Desktop browsers (1920x1080 and above)
- Tablet devices (768x1024 typical)
- Mobile devices (375x667 and above)

All interfaces follow modern web design principles with:
- Clean, intuitive layouts
- Consistent color scheme and typography
- Touch-friendly controls on mobile devices
- Accessibility features for users with disabilities
- Dark mode support

**Hardware Interfaces:**

The system does not directly interface with hardware but relies on:
- Client device capabilities (screen, touch input, camera for QR scanning)
- Server infrastructure provided by hosting platform
- Database servers managed by Supabase

**Software Interfaces:**

- **Operating System:** Platform-independent, runs in web browsers
- **Web Browser:** Requires modern browsers supporting ES6+, CSS3, and HTML5
- **Database:** PostgreSQL 14+ accessed through Supabase client library
- **Runtime:** Node.js 18+ for build and development processes

**Communication Interfaces:**

- **HTTP/HTTPS:** All client-server communication uses HTTPS for security
- **WebSocket:** Real-time features use WebSocket connections
- **REST API:** Standard RESTful API patterns for CRUD operations
- **JSON:** Data exchange format for API communication

**Memory and Storage:**

- **Client-Side Storage:** Uses browser localStorage for cart persistence and user preferences (typically 5-10 MB)
- **Session Storage:** Temporary data during user session
- **IndexedDB:** For offline PWA capabilities (up to 50 MB)
- **Server-Side Storage:** Database and file storage managed by Supabase

### 2.2.2 Product Functions

The Spice Haven system provides the following major functions:

**F1: User Management**
- User registration with email verification
- Secure login and logout
- Password reset functionality
- Profile management (name, phone, addresses)
- Role-based access control (customer, admin)

**F2: Menu Management**
- Display menu items organized by categories
- Search and filter menu items
- View detailed item information (description, price, images, dietary info)
- Mark items as featured or unavailable
- Admin CRUD operations on menu items and categories

**F3: Shopping Cart Management**
- Add items to cart with quantity selection
- Update item quantities
- Remove items from cart
- View cart total with tax calculations
- Persist cart across sessions
- Clear cart functionality

**F4: Order Management**
- Place orders with delivery/pickup options
- Select delivery address or add new address
- Choose payment method
- Apply discount codes
- View order confirmation
- Track order status in real-time
- View order history
- Reorder from previous orders
- Admin order processing and status updates

**F5: Table Booking Management**
- Select booking date and time
- Specify number of guests
- Add special requests
- Choose occasion type
- Receive booking confirmation
- View booking history
- Cancel bookings
- Admin booking approval/rejection
- Table allocation management

**F6: Payment Processing**
- Multiple payment methods (online, COD, pay at restaurant)
- Razorpay integration for online payments
- Secure payment information handling
- Payment confirmation and receipts
- Refund processing
- Payment history tracking

**F7: Loyalty Program**
- Automatic enrollment on registration
- Points earning on orders
- Multi-tier system (Bronze, Silver, Gold, Platinum)
- Points redemption for discounts
- Referral code generation
- Referral bonus points
- Loyalty dashboard with tier progress

**F8: Promotion Management**
- View active promotions
- Apply discount codes at checkout
- Admin creation of promotional campaigns
- Set validity periods and usage limits
- Track promotion performance
- Featured promotions on home page

**F9: Review and Rating System**
- Submit reviews for menu items
- Rate overall restaurant experience
- View reviews from other customers
- Admin moderation of reviews
- Feature selected reviews
- Average rating calculations

**F10: Notification System**
- Real-time order status notifications
- Booking confirmation notifications
- Promotional notifications
- Loyalty milestone notifications
- In-app notification bell
- Notification preferences management

**F11: Admin Dashboard**
- Key performance indicators (revenue, orders, bookings)
- Visual charts and graphs
- Recent orders and bookings overview
- Quick action buttons
- Business analytics and trends

**F12: Inventory Management**
- Track stock levels for menu items
- Low stock alerts
- Update inventory quantities
- Inventory history tracking
- Automatic availability updates

### 2.2.3 User Characteristics

**Customer Users:**

*Demographics:*
- Age: 18-65 years
- Education: High school to post-graduate
- Technical Expertise: Basic to intermediate
- Income Level: Middle to upper-middle class

*Behavioral Characteristics:*
- Frequent online shoppers
- Comfortable with mobile apps and websites
- Value convenience and speed
- Expect real-time information
- Prefer visual content (images, icons)
- May access system during commute or breaks

*Usage Patterns:*
- Peak usage during meal times
- Average session duration: 5-10 minutes
- Primarily mobile users (60-70%)
- Repeat customers use saved preferences
- New users need intuitive onboarding

**Administrator Users:**

*Demographics:*
- Age: 25-55 years
- Education: Graduate or higher
- Technical Expertise: Intermediate to advanced
- Role: Restaurant managers, owners, supervisors

*Behavioral Characteristics:*
- Detail-oriented and analytical
- Need comprehensive information
- Make data-driven decisions
- Multitask across different functions
- Require efficient workflows

*Usage Patterns:*
- Extended sessions (30+ minutes)
- Multiple daily logins
- Primarily desktop users
- Use system throughout business hours
- Need quick access to critical functions

### 2.2.4 Constraints

**Regulatory Constraints:**
- Must comply with data protection regulations (GDPR, local privacy laws)
- Payment processing must follow PCI DSS standards
- Food safety information display requirements
- Accessibility standards (WCAG 2.1 Level AA)

**Technical Constraints:**
- Must work on browsers released in last 3 years
- Mobile devices must have minimum 4.7-inch screens
- Requires stable internet connection (minimum 2 Mbps)
- Limited by Supabase free tier quotas (if applicable)
- Browser localStorage limitations (typically 5-10 MB)

**Business Constraints:**
- Development budget limitations
- Timeline constraints for initial release
- Single restaurant operation (no multi-branch support in v1.0)
- Limited to web platform (no native mobile apps)

**Design Constraints:**
- Must use React 18 and Vite for frontend
- Must use Supabase for backend
- Must follow responsive design principles
- Must maintain consistent branding
- Must support offline capabilities through PWA

**Security Constraints:**
- All communication must use HTTPS
- Passwords must meet complexity requirements
- Session timeout after 24 hours of inactivity
- Rate limiting on API endpoints
- Input validation and sanitization required

**Performance Constraints:**
- Page load time must be under 3 seconds on 4G
- Time to Interactive (TTI) under 5 seconds
- First Contentful Paint (FCP) under 2 seconds
- Support minimum 100 concurrent users
- Database queries must complete within 500ms

### 2.2.5 Assumptions and Dependencies

**Assumptions:**

1. Users have access to modern web browsers with JavaScript enabled
2. Users have basic familiarity with online shopping and web navigation
3. Restaurant has reliable internet connectivity
4. Menu items have digital images available
5. Restaurant staff can be trained on admin interface
6. Payment gateway services remain available and functional
7. Supabase infrastructure maintains 99.9% uptime
8. Users accept cookies and local storage for cart persistence
9. Mobile users have touch-capable devices
10. Restaurant operates during defined business hours

**Dependencies:**

*External Services:*
1. **Supabase:** Core dependency for authentication, database, and real-time features. System cannot function without Supabase availability.
2. **Razorpay:** Required for online payment processing. Alternative payment methods (COD) available if service is down.
3. **OpenStreetMap:** Used for map displays. System can function without maps but with reduced functionality.
4. **Hosting Platform (Netlify/Vercel):** Required for application deployment and CDN services.
5. **Email Service:** Needed for transactional emails. System can function but users won't receive email notifications.

*Technology Dependencies:*
1. **React 18:** Core framework dependency
2. **Node.js 18+:** Required for build process
3. **Modern Browser APIs:** localStorage, sessionStorage, Service Workers, Geolocation
4. **SSL/TLS:** Required for secure communication

*Data Dependencies:*
1. Menu items must be populated in database
2. Categories must be defined before adding menu items
3. User profile must exist before placing orders
4. Orders must exist before order items can be created
5. Valid payment required before order confirmation

*Operational Dependencies:*
1. Restaurant staff availability to process orders
2. Kitchen operational during business hours
3. Delivery personnel available for delivery orders
4. Admin access for system configuration and management

## 2.3 Functional Requirements

### FR1: User Authentication and Authorization

**FR1.1 User Registration**
- **Description:** System shall allow new users to create accounts
- **Input:** Email, password, full name, phone number
- **Processing:** Validate input, check for existing email, hash password, create user record, send verification email
- **Output:** Success message, verification email sent
- **Priority:** High
- **Dependencies:** Email service, database

**FR1.2 User Login**
- **Description:** System shall authenticate users with email and password
- **Input:** Email, password
- **Processing:** Validate credentials, create session, generate JWT token
- **Output:** Authentication token, redirect to dashboard
- **Priority:** High
- **Dependencies:** Database, session management

**FR1.3 Password Reset**
- **Description:** System shall allow users to reset forgotten passwords
- **Input:** Email address
- **Processing:** Verify email exists, generate reset token, send reset link
- **Output:** Password reset email
- **Priority:** Medium
- **Dependencies:** Email service

**FR1.4 Role-Based Access Control**
- **Description:** System shall restrict access based on user roles
- **Input:** User role (customer, admin)
- **Processing:** Check user role, apply appropriate permissions
- **Output:** Access granted or denied to specific features
- **Priority:** High
- **Dependencies:** Authentication system

### FR2: Menu Browsing and Search

**FR2.1 Display Menu Categories**
- **Description:** System shall display all menu categories
- **Input:** None (automatic on page load)
- **Processing:** Fetch categories from database, sort by display order
- **Output:** List of categories with names
- **Priority:** High
- **Dependencies:** Database

**FR2.2 Display Menu Items**
- **Description:** System shall display menu items with details
- **Input:** Optional category filter
- **Processing:** Fetch items from database, filter by availability and category
- **Output:** Grid/list of menu items with images, names, prices, descriptions
- **Priority:** High
- **Dependencies:** Database, image storage

**FR2.3 Search Menu Items**
- **Description:** System shall allow users to search menu items by name
- **Input:** Search query text
- **Processing:** Query database with text search, return matching items
- **Output:** Filtered list of menu items
- **Priority:** Medium
- **Dependencies:** Database search capability

**FR2.4 Filter Menu Items**
- **Description:** System shall allow filtering by dietary preferences
- **Input:** Filter criteria (vegetarian, vegan, spicy level)
- **Processing:** Apply filters to menu items, return matching results
- **Output:** Filtered menu items
- **Priority:** Medium
- **Dependencies:** Menu item metadata

### FR3: Shopping Cart Operations

**FR3.1 Add to Cart**
- **Description:** System shall allow users to add items to cart
- **Input:** Menu item ID, quantity
- **Processing:** Validate item availability, add to cart state, persist to localStorage
- **Output:** Cart updated, confirmation message
- **Priority:** High
- **Dependencies:** localStorage

**FR3.2 Update Cart Quantity**
- **Description:** System shall allow quantity modification
- **Input:** Cart item ID, new quantity
- **Processing:** Update cart state, recalculate totals, persist changes
- **Output:** Updated cart with new totals
- **Priority:** High
- **Dependencies:** Cart state management

**FR3.3 Remove from Cart**
- **Description:** System shall allow item removal from cart
- **Input:** Cart item ID
- **Processing:** Remove item from cart state, recalculate totals
- **Output:** Updated cart
- **Priority:** High
- **Dependencies:** Cart state management

**FR3.4 Calculate Cart Total**
- **Description:** System shall calculate total price including taxes
- **Input:** Cart items with quantities and prices
- **Processing:** Sum item totals, apply taxes, calculate final amount
- **Output:** Subtotal, tax amount, total amount
- **Priority:** High
- **Dependencies:** Pricing logic

### FR4: Order Placement and Tracking

**FR4.1 Place Order**
- **Description:** System shall allow users to place orders
- **Input:** Cart items, delivery address, payment method
- **Processing:** Validate cart, create order record, create order items, process payment
- **Output:** Order confirmation, order ID
- **Priority:** High
- **Dependencies:** Database, payment gateway

**FR4.2 Order Status Tracking**
- **Description:** System shall provide real-time order status updates
- **Input:** Order ID
- **Processing:** Fetch order status from database, subscribe to real-time updates
- **Output:** Current order status with visual progress indicator
- **Priority:** High
- **Dependencies:** Real-time subscriptions

**FR4.3 View Order History**
- **Description:** System shall display user's past orders
- **Input:** User ID
- **Processing:** Fetch orders from database, sort by date
- **Output:** List of orders with details
- **Priority:** Medium
- **Dependencies:** Database

**FR4.4 Reorder**
- **Description:** System shall allow reordering from previous orders
- **Input:** Order ID
- **Processing:** Fetch order items, add to current cart
- **Output:** Cart populated with previous order items
- **Priority:** Low
- **Dependencies:** Order history

### FR5: Table Booking

**FR5.1 Create Booking**
- **Description:** System shall allow users to book tables
- **Input:** Date, time, number of guests, special requests
- **Processing:** Validate date/time, check availability, create booking record
- **Output:** Booking confirmation
- **Priority:** High
- **Dependencies:** Database

**FR5.2 View Bookings**
- **Description:** System shall display user's bookings
- **Input:** User ID
- **Processing:** Fetch bookings from database
- **Output:** List of bookings with status
- **Priority:** Medium
- **Dependencies:** Database

**FR5.3 Cancel Booking**
- **Description:** System shall allow booking cancellation
- **Input:** Booking ID
- **Processing:** Update booking status to cancelled
- **Output:** Cancellation confirmation
- **Priority:** Medium
- **Dependencies:** Database

### FR6: Payment Processing

**FR6.1 Process Online Payment**
- **Description:** System shall process online payments through Razorpay
- **Input:** Order amount, payment details
- **Processing:** Initialize Razorpay, process payment, verify transaction
- **Output:** Payment success/failure, transaction ID
- **Priority:** High
- **Dependencies:** Razorpay API

**FR6.2 Record Payment**
- **Description:** System shall record payment transactions
- **Input:** Order ID, amount, payment method, transaction ID
- **Processing:** Create payment record in database
- **Output:** Payment record created
- **Priority:** High
- **Dependencies:** Database

**FR6.3 Process Refund**
- **Description:** System shall handle refund requests
- **Input:** Payment ID, refund amount
- **Processing:** Initiate refund through payment gateway, update payment status
- **Output:** Refund confirmation
- **Priority:** Medium
- **Dependencies:** Payment gateway

### FR7: Loyalty Program

**FR7.1 Enroll in Loyalty Program**
- **Description:** System shall automatically enroll new users
- **Input:** User registration
- **Processing:** Create loyalty account with Bronze tier
- **Output:** Loyalty account created
- **Priority:** Medium
- **Dependencies:** User registration

**FR7.2 Earn Loyalty Points**
- **Description:** System shall award points on order completion
- **Input:** Order total
- **Processing:** Calculate points (1 point per ₹10), add to user balance
- **Output:** Points credited
- **Priority:** Medium
- **Dependencies:** Order completion

**FR7.3 Redeem Points**
- **Description:** System shall allow points redemption for discounts
- **Input:** Points to redeem
- **Processing:** Validate point balance, convert to discount, apply to order
- **Output:** Discount applied
- **Priority:** Medium
- **Dependencies:** Loyalty balance

**FR7.4 Tier Progression**
- **Description:** System shall upgrade user tiers based on points
- **Input:** Current points balance
- **Processing:** Check tier thresholds, upgrade if eligible
- **Output:** Tier updated, notification sent
- **Priority:** Low
- **Dependencies:** Loyalty system

### FR8: Admin Functions

**FR8.1 Manage Menu Items**
- **Description:** Admin shall create, update, delete menu items
- **Input:** Item details (name, price, description, image, category)
- **Processing:** Validate input, perform database operation
- **Output:** Menu item created/updated/deleted
- **Priority:** High
- **Dependencies:** Admin authentication

**FR8.2 Manage Orders**
- **Description:** Admin shall view and update order status
- **Input:** Order ID, new status
- **Processing:** Validate status transition, update database
- **Output:** Order status updated
- **Priority:** High
- **Dependencies:** Admin authentication

**FR8.3 Manage Bookings**
- **Description:** Admin shall approve/reject bookings
- **Input:** Booking ID, action (approve/reject)
- **Processing:** Update booking status, send notification
- **Output:** Booking status updated
- **Priority:** High
- **Dependencies:** Admin authentication

**FR8.4 View Analytics**
- **Description:** Admin shall view business analytics
- **Input:** Date range (optional)
- **Processing:** Aggregate data, calculate metrics, generate charts
- **Output:** Dashboard with KPIs and visualizations
- **Priority:** Medium
- **Dependencies:** Database, charting library

## 2.4 Design Constraints

The following constraints must be adhered to during system design and implementation:

**DC1: Technology Stack Constraints**
- Frontend must be built using React 18.x
- Build tool must be Vite 7.x
- Backend must use Supabase as BaaS platform
- Database must be PostgreSQL 14+
- No server-side rendering frameworks (Next.js, Remix) allowed

**DC2: Architecture Constraints**
- Must follow Single Page Application (SPA) architecture
- Must implement component-based design
- Must use Context API for state management (no Redux)
- Must implement lazy loading for route components
- Must follow unidirectional data flow

**DC3: UI/UX Constraints**
- Must follow mobile-first design approach
- Must support responsive breakpoints: 320px, 768px, 1024px, 1440px
- Must maintain consistent color scheme across all pages
- Must use CSS modules or styled-components (no inline styles)
- Must provide loading states for all async operations
- Must display error messages for failed operations

**DC4: Security Constraints**
- All passwords must be hashed using bcrypt or similar
- All API calls must use HTTPS
- Must implement CSRF protection
- Must sanitize all user inputs
- Must implement rate limiting on sensitive endpoints
- Must use JWT tokens for authentication
- Tokens must expire after 24 hours

**DC5: Performance Constraints**
- Initial bundle size must not exceed 500KB (gzipped)
- Individual code chunks must not exceed 250KB
- Images must be optimized (WebP format preferred)
- Must implement code splitting for routes
- Must use lazy loading for images
- Must cache static assets for 1 year
- API responses must be cached where appropriate

**DC6: Browser Compatibility Constraints**
- Must support Chrome 90+
- Must support Firefox 88+
- Must support Safari 14+
- Must support Edge 90+
- Must gracefully degrade on older browsers
- Must not use experimental browser features without polyfills

**DC7: Accessibility Constraints**
- Must follow WCAG 2.1 Level AA guidelines
- All interactive elements must be keyboard accessible
- Must provide alt text for all images
- Must maintain sufficient color contrast (4.5:1 for text)
- Must support screen readers
- Must provide focus indicators

**DC8: Data Constraints**
- Must implement Row Level Security (RLS) on all database tables
- Must validate all data before database insertion
- Must handle database connection failures gracefully
- Must implement optimistic UI updates where appropriate
- Must maintain referential integrity in database

## 2.5 System Attributes

### 2.5.1 Reliability

**Availability:**
- System uptime: 99.5% (excluding planned maintenance)
- Planned maintenance windows: Maximum 4 hours per month
- Graceful degradation when external services are unavailable
- Offline functionality through PWA for basic operations

**Fault Tolerance:**
- System shall continue operating when non-critical services fail
- Payment failures shall not corrupt order data
- Database connection failures shall be retried automatically
- Failed API calls shall be retried with exponential backoff

**Recoverability:**
- System shall recover from crashes without data loss
- Database backups shall be performed daily
- Point-in-time recovery available for last 7 days
- Session data shall be recoverable after browser restart

**Error Handling:**
- All errors shall be logged with timestamps and context
- User-facing error messages shall be clear and actionable
- Critical errors shall trigger admin notifications
- System shall never expose sensitive information in errors

### 2.5.2 Security

**Authentication:**
- Multi-factor authentication support (future enhancement)
- Password complexity requirements enforced
- Account lockout after 5 failed login attempts
- Session timeout after 24 hours of inactivity
- Secure password reset mechanism

**Authorization:**
- Role-based access control (RBAC) implemented
- Principle of least privilege enforced
- Admin actions require elevated permissions
- API endpoints protected with authentication checks

**Data Protection:**
- All sensitive data encrypted at rest
- All communication encrypted in transit (TLS 1.3)
- Payment information never stored locally
- Personal data anonymized in logs
- Compliance with data protection regulations

**Input Validation:**
- All user inputs validated on client and server
- SQL injection prevention through parameterized queries
- XSS prevention through input sanitization
- File upload restrictions (type, size)
- Rate limiting on all API endpoints

**Audit Trail:**
- All admin actions logged with user ID and timestamp
- Order modifications tracked with history
- Login attempts logged
- Payment transactions fully auditable

### 2.5.3 Performance

**Response Time:**
- Page load time: < 3 seconds on 4G connection
- API response time: < 500ms for 95% of requests
- Search results: < 1 second
- Real-time updates: < 2 seconds latency
- Payment processing: < 5 seconds

**Throughput:**
- Support 100 concurrent users minimum
- Handle 1000 orders per day
- Process 50 bookings per day
- Support 10 admin users simultaneously

**Resource Utilization:**
- Client-side memory usage: < 100MB
- localStorage usage: < 5MB
- Network bandwidth: Optimized with compression
- Database connections: Pooled and reused

**Scalability:**
- Horizontal scaling through CDN
- Database scaling through Supabase infrastructure
- Stateless application design for easy scaling
- Caching strategy for frequently accessed data

### 2.5.4 Maintainability

**Modularity:**
- Component-based architecture
- Clear separation of concerns
- Reusable UI components
- Utility functions in separate modules

**Code Quality:**
- ESLint rules enforced
- Prettier formatting applied
- Code comments for complex logic
- Consistent naming conventions
- Maximum function length: 50 lines

**Documentation:**
- README with setup instructions
- API documentation
- Component documentation
- Database schema documentation
- Deployment guide

**Testability:**
- Unit tests for utility functions
- Integration tests for API calls
- Component tests for UI elements
- End-to-end tests for critical flows

**Versioning:**
- Semantic versioning (MAJOR.MINOR.PATCH)
- Git for version control
- Feature branches for development
- Tagged releases

### 2.5.5 Usability

**Learnability:**
- Intuitive navigation structure
- Consistent UI patterns
- Helpful tooltips and hints
- Onboarding guide for new users
- Clear call-to-action buttons

**Efficiency:**
- Minimal clicks to complete tasks
- Keyboard shortcuts for common actions
- Auto-save for forms
- Smart defaults based on user history
- Quick reorder functionality

**Memorability:**
- Consistent layout across pages
- Familiar UI patterns
- Clear visual hierarchy
- Persistent navigation

**Error Prevention:**
- Form validation with inline feedback
- Confirmation dialogs for destructive actions
- Disabled buttons when action not available
- Clear indication of required fields

**Satisfaction:**
- Smooth animations and transitions
- Responsive feedback to user actions
- Pleasant color scheme
- Professional appearance
- Mobile-optimized experience

### 2.5.6 Portability

**Platform Independence:**
- Runs on any platform with modern browser
- No platform-specific code
- Responsive design for all screen sizes

**Browser Compatibility:**
- Works on all major browsers
- Graceful degradation on older browsers
- Progressive enhancement approach

**Deployment Flexibility:**
- Can be deployed on any static hosting
- Docker containerization available
- CDN-friendly architecture
- Environment-based configuration

## 2.6 Other Requirements

### 2.6.1 Internationalization (Future)

While not implemented in version 1.0, the system should be designed to support:
- Multi-language support (English, Hindi, Kannada)
- Currency localization
- Date and time format localization
- Right-to-left language support

### 2.6.2 Legal and Compliance

**Privacy:**
- Privacy policy clearly displayed
- Cookie consent mechanism
- User data export capability
- Right to be forgotten implementation

**Terms of Service:**
- Terms clearly stated
- User acceptance required
- Refund policy documented
- Liability limitations defined

**Accessibility:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast

### 2.6.3 Business Rules

**Ordering Rules:**
- Minimum order value: ₹100
- Maximum order value: ₹10,000
- Delivery radius: 10 km
- Order cancellation allowed within 5 minutes

**Booking Rules:**
- Minimum guests: 1
- Maximum guests: 20
- Advance booking: 1 hour to 30 days
- Cancellation allowed up to 2 hours before booking time

**Loyalty Rules:**
- Points earned: 1 point per ₹10 spent
- Points redemption: 100 points = ₹10 discount
- Points expiry: 1 year from earning date
- Tier thresholds: Bronze (0), Silver (500), Gold (2000), Platinum (5000)

**Promotion Rules:**
- Maximum discount: 50%
- Minimum order for discount: ₹200
- One promotion per order
- Promotions cannot be combined

---


# CHAPTER 3: SYSTEM DESIGN

## 3.1 Introduction

System design translates the software requirements into a blueprint for implementation. This chapter presents the architectural design, data flow diagrams, and component descriptions that guide the development of the Spice Haven Restaurant Management System. The design follows modern software engineering principles including modularity, separation of concerns, and scalability.

## 3.2 Assumptions and Constraints

**Design Assumptions:**
1. Users have stable internet connectivity during active usage
2. Modern browsers with JavaScript enabled are available
3. Restaurant has defined business hours and delivery zones
4. Menu items have standardized pricing structure
5. Payment gateway services maintain consistent API contracts
6. Database schema can be extended for future enhancements

**Design Constraints:**
1. Must use React component-based architecture
2. State management limited to Context API (no external libraries)
3. Real-time features dependent on Supabase subscriptions
4. Client-side routing using React Router
5. No server-side rendering or static site generation
6. Limited to web platform (no native mobile apps)

## 3.3 Functional Decomposition

The system is decomposed into the following major subsystems:

**1. User Management Subsystem**
- Authentication Module
- Profile Management Module
- Session Management Module

**2. Menu Management Subsystem**
- Category Management Module
- Item Management Module
- Search and Filter Module

**3. Order Processing Subsystem**
- Cart Management Module
- Order Placement Module
- Order Tracking Module
- Payment Processing Module

**4. Booking Management Subsystem**
- Reservation Module
- Availability Checking Module
- Booking Confirmation Module

**5. Loyalty and Promotions Subsystem**
- Points Management Module
- Tier Management Module
- Promotion Engine Module
- Referral Module

**6. Admin Management Subsystem**
- Dashboard Module
- Menu Administration Module
- Order Administration Module
- Booking Administration Module
- Analytics Module

**7. Notification Subsystem**
- Real-time Notification Module
- Email Notification Module
- In-app Notification Module

## 3.4 System Diagrams

### 3.4.1 Context Flow Diagram (CFD)

```
                    ┌─────────────────────┐
                    │                     │
                    │   CUSTOMER USER     │
                    │                     │
                    └──────────┬──────────┘
                               │
                               │ Browse Menu
                               │ Place Orders
                               │ Make Bookings
                               │ Track Orders
                               │
                    ┌──────────▼──────────┐
                    │                     │
                    │   SPICE HAVEN      │
                    │   RESTAURANT       │◄──────────┐
                    │   MANAGEMENT       │           │
                    │   SYSTEM           │           │
                    │                    │           │
                    └──────────┬─────────┘           │
                               │                     │
                               │ Manage Menu         │
                               │ Process Orders      │
                               │ View Analytics      │
                               │                     │
                    ┌──────────▼──────────┐          │
                    │                     │          │
                    │   ADMIN USER        │          │
                    │                     │          │
                    └─────────────────────┘          │
                                                     │
    ┌────────────────────────────────────────────────┤
    │                                                │
    │  EXTERNAL SYSTEMS                              │
    │                                                │
    │  ┌──────────────┐  ┌──────────────┐          │
    │  │   Supabase   │  │   Razorpay   │          │
    │  │   Backend    │  │   Payment    │          │
    │  └──────────────┘  └──────────────┘          │
    │                                                │
    │  ┌──────────────┐  ┌──────────────┐          │
    │  │   Leaflet    │  │   Email      │          │
    │  │   Maps       │  │   Service    │          │
    │  └──────────────┘  └──────────────┘          │
    └────────────────────────────────────────────────┘
```

### 3.4.2 Data Flow Diagram Level 0

```
                    ┌─────────────┐
                    │             │
                    │  CUSTOMER   │
                    │             │
                    └──────┬──────┘
                           │
                           │ Order Details
                           │ Booking Request
                           │ User Credentials
                           │
                    ┌──────▼──────────────────┐
                    │                         │
                    │   SPICE HAVEN SYSTEM    │
                    │   (Level 0)             │
                    │                         │
                    └──────┬──────────────────┘
                           │
                           │ Order Confirmation
                           │ Booking Confirmation
                           │ Menu Information
                           │
                    ┌──────▼──────┐
                    │             │
                    │    ADMIN    │
                    │             │
                    └─────────────┘
```

### 3.4.3 Data Flow Diagram Level 1 - Customer Module

```
┌──────────┐
│ Customer │
└────┬─────┘
     │
     │ Login Credentials
     ▼
┌─────────────────┐         ┌──────────────┐
│  1.0            │         │              │
│  Authenticate   ├────────►│  User DB     │
│  User           │         │              │
└────┬────────────┘         └──────────────┘
     │ Auth Token
     │
     ▼
┌─────────────────┐         ┌──────────────┐
│  2.0            │         │              │
│  Browse Menu    │◄────────┤  Menu DB     │
│                 │         │              │
└────┬────────────┘         └──────────────┘
     │ Selected Items
     │
     ▼
┌─────────────────┐         ┌──────────────┐
│  3.0            │         │              │
│  Manage Cart    ├────────►│  Cart Store  │
│                 │         │  (Local)     │
└────┬────────────┘         └──────────────┘
     │ Cart Items
     │
     ▼
┌─────────────────┐         ┌──────────────┐
│  4.0            │         │              │
│  Place Order    ├────────►│  Orders DB   │
│                 │         │              │
└────┬────────────┘         └──────────────┘
     │ Order ID
     │
     ▼
┌─────────────────┐         ┌──────────────┐
│  5.0            │         │              │
│  Process        ├────────►│  Payment     │
│  Payment        │         │  Gateway     │
└────┬────────────┘         └──────────────┘
     │ Payment Confirmation
     │
     ▼
┌─────────────────┐
│  6.0            │
│  Track Order    │
│                 │
└─────────────────┘
```

### 3.4.4 Data Flow Diagram Level 1 - Admin Module

```
┌──────────┐
│  Admin   │
└────┬─────┘
     │
     │ Admin Credentials
     ▼
┌─────────────────┐         ┌──────────────┐
│  1.0            │         │              │
│  Admin Login    ├────────►│  User DB     │
│                 │         │              │
└────┬────────────┘         └──────────────┘
     │ Admin Token
     │
     ├────────────────────────────────────────┐
     │                                        │
     ▼                                        ▼
┌─────────────────┐         ┌──────────────────────┐
│  2.0            │         │  3.0                 │
│  Manage Menu    │         │  Manage Orders       │
│                 │         │                      │
└────┬────────────┘         └────┬─────────────────┘
     │                           │
     ▼                           ▼
┌──────────────┐         ┌──────────────┐
│  Menu DB     │         │  Orders DB   │
└──────────────┘         └──────────────┘
     │                           │
     ├───────────────────────────┤
     │                           │
     ▼                           ▼
┌─────────────────┐         ┌──────────────────────┐
│  4.0            │         │  5.0                 │
│  Manage         │         │  View Analytics      │
│  Bookings       │         │                      │
└────┬────────────┘         └──────────────────────┘
     │
     ▼
┌──────────────┐
│  Bookings DB │
└──────────────┘
```

### 3.4.5 Data Flow Diagram Level 2 - Order Processing

```
┌──────────┐
│ Customer │
└────┬─────┘
     │ Cart Items
     ▼
┌─────────────────┐
│  4.1            │
│  Validate Cart  │
│                 │
└────┬────────────┘
     │ Valid Cart
     ▼
┌─────────────────┐         ┌──────────────┐
│  4.2            │         │              │
│  Calculate      ├────────►│  Tax Rules   │
│  Total          │         │              │
└────┬────────────┘         └──────────────┘
     │ Total Amount
     ▼
┌─────────────────┐         ┌──────────────┐
│  4.3            │         │              │
│  Create Order   ├────────►│  Orders DB   │
│  Record         │         │              │
└────┬────────────┘         └──────────────┘
     │ Order ID
     ▼
┌─────────────────┐         ┌──────────────┐
│  4.4            │         │              │
│  Create Order   ├────────►│  Order Items │
│  Items          │         │  DB          │
└────┬────────────┘         └──────────────┘
     │ Order Details
     ▼
┌─────────────────┐         ┌──────────────┐
│  4.5            │         │              │
│  Initiate       ├────────►│  Payment     │
│  Payment        │         │  Gateway     │
└────┬────────────┘         └──────────────┘
     │ Payment Status
     ▼
┌─────────────────┐         ┌──────────────┐
│  4.6            │         │              │
│  Update Order   ├────────►│  Orders DB   │
│  Status         │         │              │
└────┬────────────┘         └──────────────┘
     │ Confirmation
     ▼
┌─────────────────┐
│  4.7            │
│  Send           │
│  Notification   │
└─────────────────┘
```

## 3.5 Component Description

### 3.5.1 Frontend Components

**Navigation Components:**
- **Navbar:** Primary navigation bar with logo, menu links, cart icon, and user account dropdown. Responsive design with hamburger menu for mobile.
- **Footer:** Contains links to legal pages, contact information, social media links, and copyright notice.
- **MobileBottomNav:** Fixed bottom navigation for mobile devices with icons for Home, Menu, Cart, and Profile.

**Page Components:**
- **Home:** Landing page with hero section, featured items, promotions, and call-to-action buttons.
- **Menu:** Displays menu items in grid layout with category filters, search bar, and dietary preference filters.
- **Cart:** Shows cart items with quantity controls, price breakdown, and checkout button.
- **Booking:** Form for table reservations with date picker, time selector, and guest count input.
- **Profile:** User profile page with order history, saved addresses, and account settings.
- **OrderTracking:** Real-time order status display with progress indicators and estimated delivery time.

**Admin Components:**
- **AdminDashboard:** Overview with KPIs, charts, recent orders, and quick action buttons.
- **MenuManagement:** CRUD interface for menu items with image upload and category assignment.
- **OrderManagement:** Table view of orders with status update controls and payment information.
- **BookingManagement:** Calendar view of bookings with approval/rejection controls.

**Shared Components:**
- **Modal:** Reusable modal dialog for confirmations and forms.
- **LoadingSpinner:** Loading indicator for async operations.
- **Badge:** Status badges for orders, bookings, and notifications.
- **RatingStars:** Star rating display and input component.
- **SearchBar:** Search input with debounced search functionality.
- **Pagination:** Page navigation for large data sets.

### 3.5.2 Context Providers

**AuthContext:**
- Manages user authentication state
- Provides login, logout, and registration functions
- Handles session persistence
- Exposes current user information

**CartContext:**
- Manages shopping cart state
- Provides add, update, remove cart functions
- Calculates cart totals
- Persists cart to localStorage

**NotificationContext:**
- Manages notification state
- Subscribes to real-time notifications
- Provides notification display functions
- Handles notification preferences

**LoyaltyContext:**
- Manages loyalty points and tier information
- Provides points earning and redemption functions
- Calculates tier progress
- Handles referral code generation

### 3.5.3 Utility Modules

**validators.js:**
- Input validation functions
- Email, phone, password validation
- Form validation helpers
- Data sanitization functions

**helpers.js:**
- Date formatting functions
- Currency formatting
- String manipulation utilities
- Array and object helpers

**paymentGateway.js:**
- Razorpay integration
- Payment initialization
- Payment verification
- Refund processing

**securityMiddleware.js:**
- Input sanitization
- XSS prevention
- Rate limiting
- Suspicious activity detection

---


# CHAPTER 4: DATABASE DESIGN

## 4.1 Introduction

The database design for Spice Haven uses PostgreSQL as the relational database management system, hosted and managed through Supabase. The design follows normalization principles to minimize redundancy while maintaining data integrity and query performance. Row Level Security (RLS) policies ensure data access is properly controlled based on user roles and ownership.

## 4.2 Purpose and Scope

The database serves as the central repository for all application data including user profiles, menu information, orders, bookings, payments, and loyalty program data. The design supports:
- Multi-user concurrent access
- Real-time data synchronization
- Referential integrity through foreign keys
- Audit trails through timestamps
- Scalability for growing data volumes

## 4.3 Table Definitions

### 4.3.1 profiles Table

Stores user profile information extending Supabase authentication.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User identifier |
| full_name | TEXT | NOT NULL | User's full name |
| phone | TEXT | | Contact phone number |
| role | TEXT | DEFAULT 'user', CHECK (role IN ('user', 'admin')) | User role |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- Primary key on id
- Index on role for admin queries

**RLS Policies:**
- Users can view all profiles
- Users can update only their own profile
- Users can insert only their own profile

### 4.3.2 menu_categories Table

Defines menu item categories for organization.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Category identifier |
| name | TEXT | NOT NULL, UNIQUE | Category name |
| display_order | INTEGER | DEFAULT 0 | Sort order for display |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- Primary key on id
- Unique index on name
- Index on display_order

**RLS Policies:**
- Anyone can view categories
- Only admins can modify categories

### 4.3.3 menu_items Table

Stores menu item details including pricing and availability.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Item identifier |
| name | TEXT | NOT NULL | Item name |
| description | TEXT | | Item description |
| price | DECIMAL(10,2) | NOT NULL | Item price |
| image_url | TEXT | | Primary image URL |
| image_url_2 | TEXT | | Secondary image URL |
| category_id | UUID | REFERENCES menu_categories(id) ON DELETE CASCADE | Category reference |
| is_available | BOOLEAN | DEFAULT true | Availability status |
| is_featured | BOOLEAN | DEFAULT false | Featured item flag |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- Primary key on id
- Foreign key index on category_id
- Index on is_available for filtering
- Index on is_featured for homepage queries

**RLS Policies:**
- Anyone can view menu items
- Only admins can modify menu items

### 4.3.4 orders Table

Stores order header information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Order identifier |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Customer reference |
| total | DECIMAL(10,2) | NOT NULL | Order total amount |
| status | TEXT | DEFAULT 'pending', CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')) | Order status |
| payment_status | TEXT | DEFAULT 'pending', CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) | Payment status |
| delivery_address | TEXT | | Delivery address |
| phone | TEXT | | Contact phone |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Order placement time |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update time |

**Indexes:**
- Primary key on id
- Foreign key index on user_id
- Index on status for filtering
- Index on created_at for sorting

**RLS Policies:**
- Users can view their own orders
- Admins can view all orders
- Users can create orders
- Admins can update orders

### 4.3.5 order_items Table

Stores individual items within orders.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Order item identifier |
| order_id | UUID | REFERENCES orders(id) ON DELETE CASCADE | Order reference |
| menu_item_id | UUID | REFERENCES menu_items(id) ON DELETE RESTRICT | Menu item reference |
| quantity | INTEGER | NOT NULL, CHECK (quantity > 0) | Item quantity |
| price | DECIMAL(10,2) | NOT NULL | Item price at order time |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- Primary key on id
- Foreign key index on order_id
- Foreign key index on menu_item_id

**RLS Policies:**
- Users can view items from their own orders
- Admins can view all order items
- Users can create order items for their orders

### 4.3.6 bookings Table

Stores table reservation information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Booking identifier |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Customer reference |
| booking_date | DATE | NOT NULL | Reservation date |
| booking_time | TIME | NOT NULL | Reservation time |
| guests | INTEGER | NOT NULL, CHECK (guests > 0 AND guests <= 20) | Number of guests |
| status | TEXT | DEFAULT 'pending', CHECK (status IN ('pending', 'confirmed', 'cancelled')) | Booking status |
| special_requests | TEXT | | Special requests |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Booking creation time |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update time |

**Indexes:**
- Primary key on id
- Foreign key index on user_id
- Composite index on (booking_date, booking_time)
- Index on status

**RLS Policies:**
- Users can view their own bookings
- Admins can view all bookings
- Users can create bookings
- Users can update their own bookings
- Admins can update all bookings

### 4.3.7 payments Table

Records payment transactions.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Payment identifier |
| order_id | UUID | REFERENCES orders(id) ON DELETE CASCADE | Order reference |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| payment_method | TEXT | | Payment method used |
| transaction_id | TEXT | UNIQUE | Gateway transaction ID |
| status | TEXT | DEFAULT 'pending', CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) | Payment status |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Payment timestamp |

**Indexes:**
- Primary key on id
- Foreign key index on order_id
- Unique index on transaction_id
- Index on status

**RLS Policies:**
- Users can view payments for their own orders
- Admins can view all payments
- System can create payments

### 4.3.8 reviews Table

Stores customer reviews and ratings.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Review identifier |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Reviewer reference |
| rating | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Rating (1-5 stars) |
| comment | TEXT | | Review comment |
| is_featured | BOOLEAN | DEFAULT false | Featured review flag |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Review timestamp |

**Indexes:**
- Primary key on id
- Foreign key index on user_id
- Index on is_featured
- Index on created_at

**RLS Policies:**
- Anyone can view featured reviews
- Users can view their own reviews
- Users can create reviews
- Admins can update reviews

## 4.4 Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │
│   (Supabase)    │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐         ┌──────────────────┐
│    profiles     │         │  menu_categories │
│                 │         │                  │
│ • id (PK)       │         │ • id (PK)        │
│ • full_name     │         │ • name           │
│ • phone         │         │ • display_order  │
│ • role          │         └────────┬─────────┘
└────────┬────────┘                  │
         │                           │ 1:N
         │ 1:N                       │
         │                  ┌────────▼────────┐
         │                  │   menu_items    │
         │                  │                 │
         │                  │ • id (PK)       │
         │                  │ • name          │
         │                  │ • price         │
         │                  │ • category_id   │
         │                  └────────┬────────┘
         │                           │
         │                           │ N:M (through order_items)
         │                           │
┌────────▼────────┐         ┌────────▼────────┐
│     orders      │◄────────┤  order_items    │
│                 │  1:N    │                 │
│ • id (PK)       │         │ • id (PK)       │
│ • user_id (FK)  │         │ • order_id (FK) │
│ • total         │         │ • menu_item_id  │
│ • status        │         │ • quantity      │
└────────┬────────┘         └─────────────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│    payments     │
│                 │
│ • id (PK)       │
│ • order_id (FK) │
│ • amount        │
│ • status        │
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│    bookings     │         │     reviews     │
│                 │         │                 │
│ • id (PK)       │         │ • id (PK)       │
│ • user_id (FK)  │         │ • user_id (FK)  │
│ • booking_date  │         │ • rating        │
│ • guests        │         │ • comment       │
│ • status        │         │ • is_featured   │
└─────────────────┘         └─────────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
                     │ N:1
                     │
              ┌──────▼──────┐
              │  profiles   │
              │  (user_id)  │
              └─────────────┘
```

**Relationship Descriptions:**

1. **auth.users ↔ profiles:** One-to-one relationship. Each authenticated user has exactly one profile.

2. **profiles ↔ orders:** One-to-many relationship. A user can place multiple orders.

3. **profiles ↔ bookings:** One-to-many relationship. A user can make multiple bookings.

4. **profiles ↔ reviews:** One-to-many relationship. A user can write multiple reviews.

5. **menu_categories ↔ menu_items:** One-to-many relationship. A category contains multiple menu items.

6. **orders ↔ order_items:** One-to-many relationship. An order contains multiple order items.

7. **menu_items ↔ order_items:** Many-to-many relationship through order_items. A menu item can appear in multiple orders, and an order can contain multiple menu items.

8. **orders ↔ payments:** One-to-many relationship. An order can have multiple payment attempts.

---

# CHAPTER 5: DETAILED DESIGN

## 5.1 Structure Chart

```
                    ┌──────────────────────────┐
                    │                          │
                    │   SPICE HAVEN SYSTEM     │
                    │   (Main Application)     │
                    │                          │
                    └────────────┬─────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
       ┌────────▼────────┐  ┌───▼────────┐  ┌───▼────────┐
       │   Customer      │  │   Admin    │  │   Shared   │
       │   Module        │  │   Module   │  │   Module   │
       └────────┬────────┘  └───┬────────┘  └───┬────────┘
                │               │               │
        ┌───────┼───────┐       │       ┌───────┼───────┐
        │       │       │       │       │       │       │
    ┌───▼──┐ ┌─▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
    │ Menu │ │Cart│ │Order│ │Dash │ │Menu │ │Auth │ │Noti │
    │Browse│ │Mgmt│ │Track│ │board│ │Admin│ │     │ │fic  │
    └──────┘ └────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
```

## 5.2 Module-wise Design

### 5.2.1 User Authentication Module

**Purpose:** Handle user registration, login, logout, and session management.

**Inputs:**
- Registration: email, password, full_name, phone
- Login: email, password
- Password Reset: email

**Processing:**
1. Validate input format and constraints
2. Check for existing user (registration)
3. Hash password using bcrypt
4. Create user record in Supabase Auth
5. Create profile record in profiles table
6. Generate JWT token
7. Store session in browser
8. Set authentication context

**File Handling:**
- Session token stored in localStorage
- User preferences in localStorage
- Authentication state in Context

**Outputs:**
- Success/error messages
- Authentication token
- User profile data
- Redirect to appropriate page

**Key Functions:**
```javascript
// Register new user
async function register(email, password, fullName, phone)

// Login existing user
async function login(email, password)

// Logout user
async function logout()

// Reset password
async function resetPassword(email)

// Check authentication status
function isAuthenticated()
```

### 5.2.2 Menu Management Module

**Purpose:** Display menu items, handle search and filtering, manage menu CRUD operations.

**Inputs:**
- Search query text
- Category filter selection
- Dietary preference filters
- Admin: menu item details (name, price, description, image, category)

**Processing:**
1. Fetch menu items from database
2. Apply filters (category, dietary, availability)
3. Apply search query
4. Sort by display order or relevance
5. Paginate results
6. Load images lazily
7. Admin: validate and save menu item data

**File Handling:**
- Menu images stored in Supabase Storage
- Image URLs stored in database
- Cached menu data in memory

**Outputs:**
- Filtered and sorted menu items
- Item details with images
- Success/error messages for admin operations

**Key Functions:**
```javascript
// Fetch all menu items
async function getMenuItems(filters)

// Search menu items
async function searchMenuItems(query)

// Get item details
async function getMenuItem(id)

// Admin: Create menu item
async function createMenuItem(itemData)

// Admin: Update menu item
async function updateMenuItem(id, itemData)

// Admin: Delete menu item
async function deleteMenuItem(id)
```

### 5.2.3 Order Management Module

**Purpose:** Handle order placement, tracking, and admin order processing.

**Inputs:**
- Cart items with quantities
- Delivery address
- Payment method
- Special instructions
- Admin: order status updates

**Processing:**
1. Validate cart items availability
2. Calculate totals (subtotal, tax, delivery, discount)
3. Create order record
4. Create order items records
5. Process payment
6. Update order status
7. Send confirmation notification
8. Real-time status updates
9. Admin: update order status and notify customer

**File Handling:**
- Order data persisted in database
- Order receipts generated as PDF (future)
- Transaction logs maintained

**Outputs:**
- Order confirmation with order ID
- Payment receipt
- Order tracking information
- Status update notifications

**Key Functions:**
```javascript
// Place new order
async function placeOrder(cartItems, deliveryInfo, paymentMethod)

// Get order details
async function getOrder(orderId)

// Track order status
async function trackOrder(orderId)

// Get order history
async function getOrderHistory(userId)

// Admin: Update order status
async function updateOrderStatus(orderId, newStatus)

// Calculate order total
function calculateOrderTotal(items, discounts)
```

### 5.2.4 Booking Management Module

**Purpose:** Handle table reservations and booking management.

**Inputs:**
- Booking date and time
- Number of guests
- Special requests
- Occasion type
- Admin: booking approval/rejection

**Processing:**
1. Validate date and time (future date, business hours)
2. Check table availability
3. Validate guest count
4. Create booking record
5. Send confirmation notification
6. Admin: review and approve/reject
7. Update booking status
8. Send status update notification

**File Handling:**
- Booking data in database
- Booking confirmations via email
- Calendar data for availability

**Outputs:**
- Booking confirmation
- Booking ID and details
- Status notifications
- Admin: booking list with actions

**Key Functions:**
```javascript
// Create new booking
async function createBooking(bookingData)

// Get booking details
async function getBooking(bookingId)

// Get user bookings
async function getUserBookings(userId)

// Cancel booking
async function cancelBooking(bookingId)

// Admin: Approve booking
async function approveBooking(bookingId)

// Admin: Reject booking
async function rejectBooking(bookingId, reason)

// Check availability
async function checkAvailability(date, time, guests)
```

### 5.2.5 Payment Processing Module

**Purpose:** Handle payment processing through Razorpay gateway.

**Inputs:**
- Order amount
- Payment method selection
- Customer details
- Razorpay payment response

**Processing:**
1. Initialize Razorpay with order details
2. Display payment interface
3. Handle payment callback
4. Verify payment signature
5. Create payment record
6. Update order payment status
7. Handle payment failures
8. Process refunds (admin)

**File Handling:**
- Payment records in database
- Transaction logs
- Payment receipts

**Outputs:**
- Payment success/failure status
- Transaction ID
- Payment receipt
- Updated order status

**Key Functions:**
```javascript
// Initialize payment
async function initializePayment(orderId, amount)

// Verify payment
async function verifyPayment(paymentId, orderId, signature)

// Record payment
async function recordPayment(paymentData)

// Process refund
async function processRefund(paymentId, amount)

// Get payment history
async function getPaymentHistory(userId)
```

### 5.2.6 Loyalty Program Module

**Purpose:** Manage loyalty points, tiers, and referrals.

**Inputs:**
- Order completion (for points earning)
- Points redemption request
- Referral code
- Tier progression triggers

**Processing:**
1. Calculate points earned (1 point per ₹10)
2. Add points to user balance
3. Check tier thresholds
4. Upgrade tier if eligible
5. Handle points redemption
6. Generate referral codes
7. Track referral bonuses
8. Send tier upgrade notifications

**File Handling:**
- Loyalty points in database
- Tier information
- Referral tracking

**Outputs:**
- Points balance
- Current tier
- Tier progress
- Referral code
- Redemption confirmation

**Key Functions:**
```javascript
// Earn points
async function earnPoints(userId, orderAmount)

// Redeem points
async function redeemPoints(userId, points)

// Get loyalty status
async function getLoyaltyStatus(userId)

// Check tier eligibility
function checkTierEligibility(points)

// Generate referral code
async function generateReferralCode(userId)

// Apply referral code
async function applyReferralCode(userId, referralCode)
```

### 5.2.7 Admin Dashboard Module

**Purpose:** Provide comprehensive overview and analytics for administrators.

**Inputs:**
- Date range for analytics
- Filter criteria
- Admin actions

**Processing:**
1. Fetch key performance indicators
2. Calculate revenue metrics
3. Count orders and bookings
4. Generate charts and graphs
5. Fetch recent orders
6. Fetch pending bookings
7. Calculate trends
8. Aggregate data for reports

**File Handling:**
- Analytics data from database
- Cached dashboard data
- Export reports (CSV, PDF)

**Outputs:**
- KPI cards (revenue, orders, customers)
- Charts (revenue trends, order status distribution)
- Recent orders table
- Pending bookings list
- Quick action buttons

**Key Functions:**
```javascript
// Get dashboard data
async function getDashboardData(dateRange)

// Calculate KPIs
async function calculateKPIs(dateRange)

// Get revenue trends
async function getRevenueTrends(dateRange)

// Get order statistics
async function getOrderStatistics(dateRange)

// Get top menu items
async function getTopMenuItems(limit)

// Export report
async function exportReport(reportType, dateRange)
```

---


# CHAPTER 6: IMPLEMENTATION ASPECTS

## 6.1 Deployment Setup

The Spice Haven system is deployed using modern cloud infrastructure with the following setup:

**Hosting Platform:** Netlify (Primary) / Vercel (Alternative)
- Continuous deployment from GitHub repository
- Automatic builds on push to main branch
- Preview deployments for pull requests
- Global CDN for fast content delivery
- Automatic SSL certificate provisioning
- Custom domain support

**Build Configuration:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "18"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co"
```

**Environment Variables:**
All sensitive configuration is stored as environment variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_RAZORPAY_KEY_ID
- VITE_APP_URL

**CI/CD Pipeline:**
GitHub Actions workflow for automated testing and deployment:
1. Code push triggers workflow
2. Install dependencies
3. Run linting checks
4. Run tests (if configured)
5. Build production bundle
6. Deploy to Netlify
7. Run post-deployment verification

## 6.2 Platform Details

**Frontend Platform:**
- **Framework:** React 18.2.0 with functional components and hooks
- **Build Tool:** Vite 7.3.1 for fast development and optimized production builds
- **Routing:** React Router DOM v6 with lazy loading
- **State Management:** React Context API with custom hooks
- **Styling:** CSS3 with CSS modules and CSS variables for theming

**Backend Platform:**
- **Service:** Supabase (Backend-as-a-Service)
- **Database:** PostgreSQL 14+ with PostgREST API
- **Authentication:** GoTrue (JWT-based)
- **Real-time:** WebSocket subscriptions
- **Storage:** Supabase Storage for images
- **Edge Functions:** Serverless functions for custom logic

**Development Environment:**
- **Node.js:** Version 18.x LTS
- **Package Manager:** npm 9.x
- **Code Editor:** VS Code with ESLint and Prettier extensions
- **Version Control:** Git with GitHub
- **Browser DevTools:** Chrome DevTools for debugging

**Production Environment:**
- **CDN:** Netlify Edge Network (global)
- **SSL/TLS:** Automatic HTTPS with Let's Encrypt
- **Compression:** Gzip and Brotli compression enabled
- **Caching:** Static assets cached for 1 year
- **Monitoring:** Netlify Analytics and error tracking

## 6.3 Performance Considerations

**Code Optimization:**
1. **Code Splitting:** Routes are lazy-loaded to reduce initial bundle size
2. **Tree Shaking:** Unused code eliminated during build
3. **Minification:** JavaScript and CSS minified with Terser
4. **Compression:** Gzip and Brotli compression for all assets

**Asset Optimization:**
1. **Image Optimization:** 
   - WebP format for modern browsers
   - Lazy loading for images below the fold
   - Responsive images with srcset
   - Image compression with Sharp

2. **Font Optimization:**
   - System fonts used primarily
   - Font subsetting for custom fonts
   - Font-display: swap for faster rendering

**Caching Strategy:**
1. **Static Assets:** Cached for 1 year with content hashing
2. **API Responses:** Cached with appropriate TTL
3. **Service Worker:** Caches critical assets for offline access
4. **Browser Storage:** localStorage for cart and preferences

**Performance Metrics Achieved:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Lighthouse Performance Score: 95+ (mobile), 98+ (desktop)

**Database Performance:**
1. **Indexing:** Proper indexes on frequently queried columns
2. **Query Optimization:** Efficient queries with proper joins
3. **Connection Pooling:** Managed by Supabase
4. **RLS Policies:** Optimized for performance

**Network Performance:**
1. **HTTP/2:** Multiplexing for parallel requests
2. **CDN:** Global edge network for low latency
3. **Prefetching:** Critical resources prefetched
4. **DNS Prefetch:** External domains prefetched

## 6.4 Security Implementation

**Authentication Security:**
- JWT tokens with 24-hour expiration
- Secure password hashing with bcrypt
- Email verification for new accounts
- Password reset with time-limited tokens
- Session management with automatic timeout

**Authorization Security:**
- Row Level Security (RLS) on all database tables
- Role-based access control (RBAC)
- API endpoint protection
- Admin-only routes guarded

**Input Security:**
- Client-side validation for immediate feedback
- Server-side validation for security
- Input sanitization to prevent XSS
- Parameterized queries to prevent SQL injection
- File upload restrictions (type, size)

**Network Security:**
- HTTPS enforcement (HTTP redirects to HTTPS)
- Content Security Policy (CSP) headers
- CORS configuration
- Rate limiting on API endpoints
- DDoS protection through CDN

**Data Security:**
- Encryption at rest (database)
- Encryption in transit (TLS 1.3)
- Sensitive data never logged
- Payment information not stored locally
- PCI DSS compliance through Razorpay

**Application Security:**
- Regular dependency updates
- Security audit with npm audit
- Error messages don't expose system details
- Suspicious activity detection
- OWASP Top 10 coverage

---

# CHAPTER 7: PROGRAM CODE

## 7.1 Database Connection

**Supabase Client Initialization:**

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper function to handle database errors
export function handleDatabaseError(error) {
  console.error('Database error:', error);
  if (error.code === 'PGRST116') {
    return 'No data found';
  }
  if (error.code === '23505') {
    return 'Duplicate entry';
  }
  return error.message || 'Database operation failed';
}
```

## 7.2 Authentication Functions

**User Registration:**

```javascript
// src/context/AuthContext.jsx
export async function register(email, password, fullName, phone) {
  try {
    // Validate inputs
    if (!email || !password || !fullName) {
      throw new Error('All fields are required');
    }
    
    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });
    
    if (error) throw error;
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}
```

**User Login:**

```javascript
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    return { 
      success: true, 
      user: data.user, 
      profile 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}
```

**Password Reset:**

```javascript
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message };
  }
}
```

## 7.3 CRUD Operations

**Create Menu Item (Admin):**

```javascript
export async function createMenuItem(itemData) {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        category_id: itemData.categoryId,
        image_url: itemData.imageUrl,
        is_available: itemData.isAvailable ?? true,
        is_featured: itemData.isFeatured ?? false
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Create menu item error:', error);
    return { success: false, error: error.message };
  }
}
```

**Read Menu Items:**

```javascript
export async function getMenuItems(filters = {}) {
  try {
    let query = supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories (
          id,
          name
        )
      `)
      .eq('is_available', true);
    
    // Apply category filter
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    // Apply search filter
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    // Apply featured filter
    if (filters.featured) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Get menu items error:', error);
    return { success: false, error: error.message };
  }
}
```

**Update Order Status (Admin):**

```javascript
export async function updateOrderStatus(orderId, newStatus) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Send notification to customer
    await sendOrderStatusNotification(orderId, newStatus);
    
    return { success: true, data };
  } catch (error) {
    console.error('Update order status error:', error);
    return { success: false, error: error.message };
  }
}
```

**Delete Menu Item (Admin):**

```javascript
export async function deleteMenuItem(itemId) {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Delete menu item error:', error);
    return { success: false, error: error.message };
  }
}
```

## 7.4 Validation Functions

**Email Validation:**

```javascript
// src/utils/validators.js
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**Password Validation:**

```javascript
export function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumber) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

**Phone Number Validation:**

```javascript
export function validatePhone(phone) {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number
  return phoneRegex.test(phone);
}
```

**Form Validation:**

```javascript
export function validateBookingForm(formData) {
  const errors = {};
  
  if (!formData.date) {
    errors.date = 'Date is required';
  } else {
    const bookingDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      errors.date = 'Date cannot be in the past';
    }
  }
  
  if (!formData.time) {
    errors.time = 'Time is required';
  }
  
  if (!formData.guests || formData.guests < 1) {
    errors.guests = 'Number of guests must be at least 1';
  } else if (formData.guests > 20) {
    errors.guests = 'Maximum 20 guests allowed';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

## 7.5 Search and Filter Functions

**Menu Search:**

```javascript
export function searchMenuItems(items, searchQuery) {
  if (!searchQuery || searchQuery.trim() === '') {
    return items;
  }
  
  const query = searchQuery.toLowerCase().trim();
  
  return items.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(query);
    const descMatch = item.description?.toLowerCase().includes(query);
    const categoryMatch = item.menu_categories?.name.toLowerCase().includes(query);
    
    return nameMatch || descMatch || categoryMatch;
  });
}
```

**Menu Filtering:**

```javascript
export function filterMenuItems(items, filters) {
  let filtered = [...items];
  
  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(item => 
      item.category_id === filters.category
    );
  }
  
  // Filter by dietary preferences
  if (filters.vegetarian) {
    filtered = filtered.filter(item => item.is_vegetarian);
  }
  
  if (filters.vegan) {
    filtered = filtered.filter(item => item.is_vegan);
  }
  
  // Filter by spice level
  if (filters.spiceLevel) {
    filtered = filtered.filter(item => 
      item.spice_level === filters.spiceLevel
    );
  }
  
  // Filter by price range
  if (filters.minPrice) {
    filtered = filtered.filter(item => 
      item.price >= filters.minPrice
    );
  }
  
  if (filters.maxPrice) {
    filtered = filtered.filter(item => 
      item.price <= filters.maxPrice
    );
  }
  
  return filtered;
}
```

**Sort Function:**

```javascript
export function sortMenuItems(items, sortBy) {
  const sorted = [...items];
  
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    
    case 'popular':
      return sorted.sort((a, b) => (b.order_count || 0) - (a.order_count || 0));
    
    default:
      return sorted;
  }
}
```

## 7.6 Payment Integration

**Initialize Razorpay Payment:**

```javascript
// src/utils/paymentGateway.js
export async function initializeRazorpayPayment(orderData) {
  return new Promise((resolve, reject) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Spice Haven',
      description: `Order #${orderData.orderId}`,
      order_id: orderData.razorpayOrderId,
      handler: function (response) {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature
        });
      },
      prefill: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        contact: orderData.customerPhone
      },
      theme: {
        color: '#d4a853'
      },
      modal: {
        ondismiss: function() {
          reject(new Error('Payment cancelled by user'));
        }
      }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  });
}
```

**Verify Payment:**

```javascript
export async function verifyPayment(paymentData) {
  try {
    // In production, this should be done on server-side
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        order_id: paymentData.orderId,
        amount: paymentData.amount,
        payment_method: 'razorpay',
        transaction_id: paymentData.paymentId,
        status: 'completed'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update order payment status
    await supabase
      .from('orders')
      .update({ payment_status: 'completed' })
      .eq('id', paymentData.orderId);
    
    return { success: true, data };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { success: false, error: error.message };
  }
}
```

---

