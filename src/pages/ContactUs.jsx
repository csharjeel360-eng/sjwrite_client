import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function ContactUs() {
  return (
    <main className="min-h-screen bg-white">
      <Helmet>
        <title>Contact Us - SJWrites</title>
        <meta name="description" content="Contact SJWrites" />
      </Helmet>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-700 mb-6">We'd love to hear from you. Use the details below to reach out.</p>

          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-lg font-medium">Phone</h2>
              <p className="text-gray-600">+92 359 579107</p>
            </div>

            <div>
              <h2 className="text-lg font-medium">Email</h2>
              <p className="text-gray-600">teckysoutions360@gmail.com</p>
            </div>

            <div>
              <h2 className="text-lg font-medium">Address</h2>
              <p className="text-gray-600">Islamabad, Capital Territory 44000, Pakistan</p>
            </div>

            <div>
              <h2 className="text-lg font-medium">Message</h2>
              <form
                onSubmit={(e) => { e.preventDefault(); alert('Thanks — message sending not configured in this demo.'); }}
                className="space-y-3"
              >
                <textarea className="w-full border border-gray-300 rounded p-2" rows={6} placeholder="Your message..." />
                <button className="px-4 py-2 bg-black text-white rounded">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
