import { motion } from 'framer-motion';

const Disclaimer = () => {
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
      <section className="relative bg-gradient-to-br from-red-700 to-orange-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Disclaimer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-xl max-w-3xl mx-auto"
          >
            Important information about the content and use of SJWrites
          </motion.p>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg className="w-full h-12 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Disclaimer Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-8"
          >
            {/* Warning Banner */}
            <motion.div variants={itemVariants} className="p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-gray-800 font-semibold">
                ⚠️ <strong>Important Disclaimer:</strong> Please read this entire disclaimer carefully before using SJWrites.
              </p>
            </motion.div>

            {/* 1. General Disclaimer */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. General Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                SJWrites ("the Service") and all content provided herein (including but not limited to text, graphics, images, articles, blogs, information, and any other materials) are provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. To the fullest extent permissible by law, SJWrites disclaims all warranties, express or implied, including but not limited to:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties of non-infringement of intellectual property rights</li>
                <li>Warranties regarding the accuracy, completeness, or reliability of content</li>
                <li>Warranties that the service will be uninterrupted or error-free</li>
              </ul>
            </motion.div>

            {/* 2. Content Not Professional Advice */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Content Is Not Professional Advice</h2>
              <p className="text-gray-600 mb-4">
                All content published on SJWrites, including articles, guides, tutorials, and information, is provided for educational and informational purposes only. It should NOT be considered:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Professional legal advice – Consult a qualified attorney for legal matters</li>
                <li>Medical advice – Consult a healthcare professional for medical concerns</li>
                <li>Financial or investment advice – Consult a financial advisor for financial decisions</li>
                <li>Professional business consulting – Consult qualified professionals for business matters</li>
                <li>Technical support – Contact official support channels for technical issues</li>
              </ul>
              <p className="text-gray-600">
                <strong>Any reliance on the information provided is at your own risk.</strong>
              </p>
            </motion.div>

            {/* 3. Accuracy of Information */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Accuracy of Information</h2>
              <p className="text-gray-600 mb-4">
                While we strive to provide accurate and up-to-date information, SJWrites makes no guarantees regarding:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>The accuracy or completeness of any content</li>
                <li>The correctness of factual assertions or claims</li>
                <li>The timeliness or currency of information provided</li>
                <li>The absence of errors, omissions, or inaccuracies</li>
              </ul>
              <p className="text-gray-600">
                Content may become outdated, and we may not always have the resources to update it promptly.
              </p>
            </motion.div>

            {/* 4. No Liability for Damages */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. No Liability for Damages</h2>
              <p className="text-gray-600 mb-4">
                To the maximum extent permitted by applicable law, SJWrites and its owners, employees, contributors, and agents shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to damages for:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Loss of profits, revenue, or income</li>
                <li>Loss of business or business opportunity</li>
                <li>Loss of data or information</li>
                <li>Personal injury or property damage</li>
                <li>Emotional distress or psychological harm</li>
                <li>Any other consequential or incidental loss</li>
              </ul>
              <p className="text-gray-600">
                This applies even if SJWrites has been advised of the possibility of such damages.
              </p>
            </motion.div>

            {/* 5. External Links and Third-Party Content */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. External Links and Third-Party Content</h2>
              <p className="text-gray-600 mb-4">
                SJWrites may contain links to external websites and third-party content. We do NOT:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Endorse, approve, or assume responsibility for external content</li>
                <li>Warrant the accuracy or reliability of linked resources</li>
                <li>Monitor or control external websites or their policies</li>
                <li>Assume liability for damages caused by external sites or services</li>
              </ul>
              <p className="text-gray-600">
                Your access to external sites is at your own risk and governed by their terms and policies.
              </p>
            </motion.div>

            {/* 6. No Endorsement */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. No Endorsement of Products or Services</h2>
              <p className="text-gray-600 mb-4">
                Any mention of products, services, companies, or individuals on SJWrites does not constitute an endorsement or recommendation. We do not warrant that:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Products or services mentioned are suitable for your needs</li>
                <li>Information about products or services is accurate or complete</li>
                <li>Prices, availability, or terms remain current</li>
                <li>Any product or service will meet your expectations</li>
              </ul>
            </motion.div>

            {/* 7. User Responsibility */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Responsibility</h2>
              <p className="text-gray-600 mb-4">
                You are solely responsible for:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Evaluating the suitability of any information for your purposes</li>
                <li>Seeking professional advice before making important decisions</li>
                <li>Verifying information from independent sources when necessary</li>
                <li>Understanding the risks associated with relying on user-generated content</li>
                <li>Your use of the Service and any consequences thereof</li>
              </ul>
            </motion.div>

            {/* 8. Technical Disclaimer */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Technical Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                SJWrites makes no warranty that:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>The Service will be available at all times</li>
                <li>The Service will be free from errors or interruptions</li>
                <li>The Service will be secure or protected from unauthorized access</li>
                <li>Your data will not be lost or corrupted</li>
                <li>The Service will remain compatible with all devices and browsers</li>
              </ul>
            </motion.div>

            {/* 9. Medical and Health Disclaimer */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Medical and Health Information Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                <strong>IF SJWrites contains health-related content:</strong>
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Such content is provided for informational purposes only</li>
                <li>It is not a substitute for professional medical advice, diagnosis, or treatment</li>
                <li>Always consult with a qualified healthcare provider before making health decisions</li>
                <li>Never delay seeking medical advice or disregard professional advice based on content from SJWrites</li>
                <li>SJWrites is not liable for any health-related decisions or outcomes</li>
              </ul>
            </motion.div>

            {/* 10. Legal Disclaimer */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Legal Information Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                <strong>IF SJWrites contains legal information:</strong>
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Such information is provided for educational purposes only</li>
                <li>It does not constitute legal advice or create an attorney-client relationship</li>
                <li>Laws vary by jurisdiction and change frequently</li>
                <li>Always consult with a qualified attorney for legal advice specific to your situation</li>
                <li>SJWrites is not liable for any legal decisions or consequences</li>
              </ul>
            </motion.div>

            {/* 11. Financial Disclaimer */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Financial and Investment Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                <strong>IF SJWrites contains financial or investment information:</strong>
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Such information is provided for educational purposes only</li>
                <li>It is not financial advice or a recommendation to buy or sell any asset</li>
                <li>Past performance does not guarantee future results</li>
                <li>Always consult with a qualified financial advisor before making investment decisions</li>
                <li>SJWrites is not liable for financial losses or investment outcomes</li>
              </ul>
            </motion.div>

            {/* 12. Changes to Content */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Content and Service</h2>
              <p className="text-gray-600 mb-4">
                SJWrites reserves the right to:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Modify, update, or remove any content at any time without notice</li>
                <li>Change or discontinue the Service or any part thereof</li>
                <li>Modify these disclaimers without prior notice</li>
              </ul>
              <p className="text-gray-600">
                Your continued use of SJWrites following such changes constitutes your acceptance of the new terms.
              </p>
            </motion.div>

            {/* 13. User-Generated Content Disclaimer */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. User-Generated Content Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                SJWrites may contain comments, feedback, or content submitted by users. SJWrites:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Does not endorse or approve user-generated content</li>
                <li>Is not responsible for the accuracy or legality of such content</li>
                <li>Does not guarantee moderation or removal of inappropriate content</li>
                <li>Is not liable for any claims or damages related to user-generated content</li>
              </ul>
            </motion.div>

            {/* 14. Governing Law */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-600 mb-4">
                This disclaimer is governed by the laws of the jurisdiction where SJWrites operates. You agree to submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </motion.div>

            {/* 15. Severability */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Severability</h2>
              <p className="text-gray-600 mb-4">
                If any part of this disclaimer is found to be invalid or unenforceable, the remaining parts shall continue in full force and effect.
              </p>
            </motion.div>

            {/* Final Note */}
            <motion.div variants={itemVariants} className="mt-12 p-6 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-gray-800">
                <strong>Final Important Note:</strong> By using SJWrites, you acknowledge that you have read, understood, and agree to be bound by this disclaimer. If you do not agree with any part of this disclaimer, you must discontinue use of the Service immediately. For any questions about this disclaimer, please contact us through our Contact Us page.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Disclaimer;
