export default function TermsPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Please read these Terms of Service carefully before using SpeakWise. By using our platform, you agree to these terms.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: October 4, 2025
          </p>
        </div>

        <div className="space-y-12">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">📋 Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using SpeakWise ("Service," "Platform," "we," "us," or "our"), you ("User," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">🎯 Description of Service</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Platform Purpose</h3>
              <p className="text-muted-foreground">SpeakWise is a platform that enables:</p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Conference attendees to provide anonymous feedback on speakers</li>
                <li>• Speakers to build public portfolios of their speaking engagements</li>
                <li>• Organizers to manage events and collect structured feedback</li>
                <li>• External users to discover and request speakers for events</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">👤 User Categories and Eligibility</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">User Types</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Attendees:</strong> Conference participants providing feedback</li>
                <li><strong>Speakers:</strong> Professionals creating profiles and tracking performance</li>
                <li><strong>Organizers:</strong> Event hosts managing events and attendee lists</li>
                <li><strong>External Users:</strong> Individuals browsing speaker profiles</li>
              </ul>
              
              <h3 className="text-xl font-medium">Eligibility Requirements</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Must be at least 13 years of age</li>
                <li>• Must provide accurate registration information</li>
                <li>• Must comply with all applicable laws and regulations</li>
                <li>• Must not be prohibited from using the Service under applicable law</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">🚫 User Conduct and Responsibilities</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Prohibited Activities</h3>
              <p className="text-muted-foreground mb-3">You may not:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Provide false or misleading information</li>
                <li>• Impersonate others or create fake profiles</li>
                <li>• Submit fraudulent feedback or manipulate ratings</li>
                <li>• Upload malicious content or software</li>
                <li>• Violate intellectual property rights</li>
                <li>• Harass, threaten, or abuse other users</li>
                <li>• Attempt to circumvent security measures</li>
                <li>• Use the Service for illegal purposes</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Feedback Guidelines</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                When providing feedback: Be honest and constructive, focus on professional performance, avoid personal attacks, respect the anonymous nature of the system, and do not attempt to identify other feedback providers.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">📄 Content and Intellectual Property</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">User Content</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• You retain ownership of content you submit</li>
                <li>• You grant us a license to use, display, and distribute your content</li>
                <li>• You represent that you have the right to submit all content</li>
                <li>• You are responsible for ensuring content accuracy</li>
              </ul>

              <h3 className="text-xl font-medium">Speaker Profiles</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Profile information becomes publicly available</li>
                <li>• You control what information to include</li>
                <li>• You may update or delete your profile at any time</li>
                <li>• False or misleading profile information violates these Terms</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">🔒 Feedback and Verification System</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Attendee Verification</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• In-person attendees must verify email addresses against attendance lists</li>
                <li>• Virtual attendees may provide feedback without email verification</li>
                <li>• Verification is required to maintain feedback quality</li>
                <li>• False verification attempts violate these Terms</li>
              </ul>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🔐 Anonymous Feedback</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  All feedback is processed anonymously after verification. We cannot and will not reveal feedback sources. Manipulation of the feedback system is prohibited.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">⚖️ Disclaimers and Limitations</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Service Disclaimers</h3>
              <p className="text-muted-foreground mb-3">The Service is provided "AS IS" without warranties of any kind, including:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Accuracy or reliability of user-generated content</li>
                <li>• Uninterrupted or error-free operation</li>
                <li>• Fitness for particular purposes</li>
                <li>• Non-infringement of third-party rights</li>
              </ul>

              <h3 className="text-xl font-medium">Limitation of Liability</h3>
              <p className="text-muted-foreground mb-3">To the maximum extent permitted by law:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Our liability is limited to the amount you paid us in the past 12 months</li>
                <li>• We are not liable for indirect, incidental, or consequential damages</li>
                <li>• We are not responsible for third-party actions or content</li>
                <li>• Users assume all risks of using the Service</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">🚪 Termination</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Termination by You</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• You may deactivate your account at any time</li>
                  <li>• Deactivation does not affect previously submitted anonymous feedback</li>
                  <li>• Some information may remain in aggregated form</li>
                  <li>• Speaker profiles can be deleted or made private</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Termination by Us</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Violation of these Terms</li>
                  <li>• Illegal or harmful activity</li>
                  <li>• Extended periods of inactivity</li>
                  <li>• Business or legal reasons</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">📞 Contact Information</h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg space-y-3">
              <p className="text-sm">For questions about these Terms:</p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Email:</strong> legal@speakwise.com</p>
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
              <strong>⚠️ Important Notice:</strong> These Terms of Service are designed to protect both SpeakWise and its users while ensuring compliance with applicable laws. For specific legal advice regarding your use of the Service, consult with qualified legal counsel.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}