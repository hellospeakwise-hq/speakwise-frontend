export default function PrivacyPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn how SpeakWise protects your privacy and handles your personal data in compliance with GDPR, CCPA, and other privacy regulations.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: October 4, 2025
          </p>
        </div>

        <div className="space-y-12">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">🛡️ Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              SpeakWise ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">👁️ Information We Collect</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-3">Information You Provide</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Account Information:</strong> Name, email address, bio, expertise, social links (for speakers and organizers)</li>
                  <li><strong>Event Information:</strong> Event details, speaker information, session details (for organizers)</li>
                  <li><strong>Feedback Data:</strong> Ratings, comments, and session selections (anonymized after verification)</li>
                  <li><strong>Profile Data:</strong> Professional information, speaking history, photos (for speakers)</li>
                  <li><strong>Attendance Lists:</strong> Email addresses for verification purposes (for organizers)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Information Collected Automatically</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                  <li><strong>Cookies and Tracking:</strong> As described in our Cookie Policy</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🔒 Anonymous Feedback</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Feedback submissions are processed anonymously. After verification, we permanently remove all identifiable links between feedback and individual attendees.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">👥 How We Use Your Information</h2>
            <div>
              <h3 className="text-xl font-medium mb-3">Primary Uses</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Verification:</strong> Verify attendee participation against uploaded attendance lists</li>
                <li><strong>Feedback Processing:</strong> Collect and aggregate anonymous feedback for speakers</li>
                <li><strong>Profile Management:</strong> Display speaker profiles and performance metrics</li>
                <li><strong>Event Management:</strong> Facilitate event creation and attendee management</li>
                <li><strong>Analytics:</strong> Generate traction scores and performance metrics</li>
                <li><strong>Communication:</strong> Send service-related notifications and updates</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">🔐 Data Security</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Security Measures</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Encryption of all data transmissions</li>
                  <li>• Role-based access controls</li>
                  <li>• Immediate anonymization of feedback</li>
                  <li>• Regular security audits</li>
                  <li>• Staff training on data protection</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Data Retention</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Account data: While active + legal requirements</li>
                  <li>• Anonymous feedback: Retained indefinitely</li>
                  <li>• Attendance lists: Deleted after 30 days</li>
                  <li>• Verification data: Deleted immediately</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">⚖️ Your Rights and Choices</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Data Subject Rights (GDPR/CCPA)</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                </ul>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Restriction:</strong> Limit processing of your personal data</li>
                  <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">📧 Exercise Your Rights</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Contact us at <strong>privacy@speakwise.com</strong> with your request. We will respond within 30 days for GDPR requests and as required by applicable law.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">🌍 International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may transfer your information to countries outside your residence. When we do, we rely on adequacy decisions by relevant authorities, use approved contractual protections, and implement supplementary measures as needed.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">📞 Contact Information</h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg space-y-3">
              <p className="text-sm">For privacy-related questions or requests:</p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Email:</strong> privacy@speakwise.com</p>
                  <p><strong>General Contact:</strong> speakwise@gmail.com</p>
                </div>
                <div>
                  <p><strong>Phone:</strong> +233 55 555 5555</p>
                  <p><strong>Address:</strong> Accra, Ghana</p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              <strong>⚠️ Important:</strong> This Privacy Policy is designed to comply with GDPR, CCPA, and other applicable privacy laws. For specific legal advice, consult with qualified legal counsel.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}