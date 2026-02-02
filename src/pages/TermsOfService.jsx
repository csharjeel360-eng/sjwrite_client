import { motion } from 'framer-motion';

const TermsOfService = () => {
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
            Terms of Service
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-xl max-w-3xl mx-auto"
          >
            Please read these terms carefully before using our service
          </motion.p>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg className="w-full h-12 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-8"
          >
            {/* Last Updated */}
            <motion.div variants={itemVariants} className="text-sm text-gray-600 mb-8">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.div>

            {/* 1. Acceptance of Terms */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using SJWrites ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </motion.div>

            {/* 2. Use License */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on SJWrites for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on SJWrites</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                <li>Violating any laws, regulations, or third-party rights</li>
              </ul>
            </motion.div>

            {/* 3. Disclaimer */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                The materials on SJWrites are provided on an 'as is' basis. SJWrites makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p className="text-gray-600 mb-4">
                Further, SJWrites does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.
              </p>
            </motion.div>

            {/* 4. Limitations */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations of Liability</h2>
              <p className="text-gray-600 mb-4">
                In no event shall SJWrites or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SJWrites, even if SJWrites or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </motion.div>

            {/* 5. Accuracy of Materials */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
              <p className="text-gray-600 mb-4">
                The materials appearing on SJWrites could include technical, typographical, or photographic errors. SJWrites does not warrant that any of the materials on its web site are accurate, complete, or current. SJWrites may make changes to the materials contained on its web site at any time without notice.
              </p>
            </motion.div>

            {/* 6. Materials and Content */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Materials and Content</h2>
              <p className="text-gray-600 mb-4">
                SJWrites has not reviewed all of the sites linked to its web site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by SJWrites of the site. Use of any such linked web site is at the user's own risk.
              </p>
            </motion.div>

            {/* 7. Modifications */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications to Terms</h2>
              <p className="text-gray-600 mb-4">
                SJWrites may revise these terms of service for its web site at any time without notice. By using this web site you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </motion.div>

            {/* 8. User Content */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. User-Generated Content</h2>
              <p className="text-gray-600 mb-4">
                Any content you submit, post, or display on SJWrites ("User Content") becomes the intellectual property of SJWrites. By submitting content, you grant SJWrites a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any media or medium and for any purposes.
              </p>
              <p className="text-gray-600 mb-4">
                You represent and warrant that:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>You own or control all rights to the content you submit</li>
                <li>The content does not violate any third-party rights</li>
                <li>You have all necessary permissions to grant the rights granted in this section</li>
              </ul>
            </motion.div>

            {/* 9. Prohibited Conduct */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Prohibited Conduct</h2>
              <p className="text-gray-600 mb-4">
                You agree not to:
              </p>
              <ul className="text-gray-600 list-disc pl-5 mb-4 space-y-2">
                <li>Harass, threaten, or intimidate any user or staff member</li>
                <li>Post content that is illegal, obscene, defamatory, or harassing</li>
                <li>Attempt to gain unauthorized access to SJWrites systems</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Spam or send unsolicited messages</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on any intellectual property rights</li>
              </ul>
            </motion.div>

            {/* 10. Privacy */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Privacy Policy</h2>
              <p className="text-gray-600 mb-4">
                Your use of SJWrites is also governed by our Privacy Policy. Please review our Privacy Policy to understand our privacy practices. By using SJWrites, you consent to our data practices as outlined in the Privacy Policy.
              </p>
            </motion.div>

            {/* 11. Governing Law */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-600 mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where SJWrites operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </motion.div>

            {/* 12. Termination */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination of Service</h2>
              <p className="text-gray-600 mb-4">
                SJWrites may terminate or suspend your access to the service at any time, without notice, for any reason, including if you violate these Terms of Service. Upon termination, your right to use the service will immediately cease.
              </p>
            </motion.div>

            {/* 13. External Links */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. External Links and Third-Party Content</h2>
              <p className="text-gray-600 mb-4">
                SJWrites may contain links to external websites and third-party content. We are not responsible for the content, accuracy, or practices of external sites. Your use of external sites is at your own risk and governed by their terms and policies.
              </p>
            </motion.div>

            {/* 14. Entire Agreement */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Entire Agreement</h2>
              <p className="text-gray-600 mb-4">
                These Terms of Service and our Privacy Policy constitute the entire agreement between you and SJWrites regarding your use of the service and supersede all prior agreements and understandings.
              </p>
            </motion.div>

            {/* 15. Severability */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Severability</h2>
              <p className="text-gray-600 mb-4">
                If any provision of these Terms of Service is found to be invalid or unenforceable, such provision shall be severed, and the remaining provisions shall continue in full force and effect.
              </p>
            </motion.div>

            {/* 16. Contact Information */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us through our Contact Us page or email us directly. We'll be happy to address any concerns.
              </p>
            </motion.div>

            {/* Footer Note */}
            <motion.div variants={itemVariants} className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-gray-700">
                <strong>Note:</strong> These Terms of Service are provided for general information purposes. If you have specific legal questions, please consult with a qualified attorney. SJWrites reserves the right to update these terms at any time.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
