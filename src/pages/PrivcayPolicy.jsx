import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black to-purple-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-xl max-w-3xl mx-auto"
          >
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </motion.p>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg className="w-full h-12 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
             className="prose prose-lg max-w-none"
          >
            <motion.p variants={itemVariants} className="text-gray-600 mb-8">
              At Knowledge Platform, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share your personal information when you use our website and services.
            </motion.p>

            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
              1. Information We Collect
            </motion.h2>
            
            <motion.h3 variants={itemVariants} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              Personal Information
            </motion.h3>
            <motion.p variants={itemVariants} className="text-gray-600 mb-4">
              When you register for an account, subscribe to our newsletter, or contact us, we may collect personal information such as:
            </motion.p>
            <motion.ul variants={itemVariants} className="text-gray-600 list-disc pl-5 mb-6">
              <li>Name and contact information (email address, etc.)</li>
              <li>Demographic information (age, gender, location)</li>
              <li>Professional information (occupation, industry)</li>
              <li>Payment information for premium services</li>
            </motion.ul>

            <motion.h3 variants={itemVariants} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              Usage Data
            </motion.h3>
            <motion.p variants={itemVariants} className="text-gray-600 mb-4">
              We automatically collect information about your interaction with our services, including:
            </motion.p>
            <motion.ul variants={itemVariants} className="text-gray-600 list-disc pl-5 mb-6">
              <li>IP address and device information</li>
              <li>Browser type and settings</li>
              <li>Pages visited and time spent on our platform</li>
              <li>Search queries and content engagement</li>
            </motion.ul>

            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
              2. How We Use Your Information
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-4">
              We use the information we collect for various purposes, including:
            </motion.p>
            <motion.ul variants={itemVariants} className="text-gray-600 list-disc pl-5 mb-6">
              <li>Providing, maintaining, and improving our services</li>
              <li>Personalizing your experience and content recommendations</li>
              <li>Communicating with you about updates, security alerts, and support messages</li>
              <li>Processing transactions and sending related information</li>
              <li>Detecting, preventing, and addressing technical issues and fraud</li>
            </motion.ul>

            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
              3. Information Sharing and Disclosure
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-4">
              We may share your information in the following circumstances:
            </motion.p>
            <motion.ul variants={itemVariants} className="text-gray-600 list-disc pl-5 mb-6">
              <li>With service providers who assist in our operations</li>
              <li>When required by law or to respond to legal process</li>
              <li>To protect the rights and property of Knowledge Platform</li>
              <li>In connection with a merger, acquisition, or sale of all or a portion of our assets</li>
            </motion.ul>

            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
              4. Cookies and Tracking Technologies
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-4">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </motion.p>
            <motion.p variants={itemVariants} className="text-gray-600 mb-6">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </motion.p>

            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
              5. Data Security
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-6">
              The security of your data is important to us. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </motion.p>

            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
              6. Your Data Rights
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </motion.p>
            <motion.ul variants={itemVariants} className="text-gray-600 list-disc pl-5 mb-6">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify or update inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Restrict or object to our processing of your personal data</li>
              <li>Data portability rights</li>
              <li>Withdraw consent at any time where we rely on consent to process your data</li>
            </motion.ul>

            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
              7. Children's Privacy
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-6">
              Our service is not intended for children under the age of 16. We do not knowingly collect personally identifiable information from children under 16. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to remove such information.
            </motion.p>

            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
              8. Changes to This Privacy Policy
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-6">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;