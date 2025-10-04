export default function CookiesPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn about how SpeakWise uses cookies and similar technologies to improve your experience and comply with privacy regulations.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: October 4, 2025
          </p>
        </div>

        <div className="space-y-12">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">🍪 What Are Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device (computer, smartphone, tablet) when you visit a website. They help websites remember information about your visit, such as your preferences and actions.
            </p>
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Types of Cookies</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Session Cookies:</strong> Temporary cookies deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
                <li><strong>First-Party Cookies:</strong> Set by SpeakWise directly</li>
                <li><strong>Third-Party Cookies:</strong> Set by external services we use</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">🛠️ How We Use Cookies</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-3">Essential Cookies</h3>
                <p className="text-muted-foreground mb-3">These cookies are necessary for the Service to function properly:</p>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li><strong>session_id:</strong> Maintain user session and authentication</li>
                    <li><strong>csrf_token:</strong> Protect against cross-site request forgery</li>
                    <li><strong>user_preferences:</strong> Remember user settings and preferences</li>
                    <li><strong>language_preference:</strong> Store language selection</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Analytics Cookies</h3>
                <p className="text-muted-foreground mb-3">These cookies help us understand how users interact with our Service:</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li><strong>analytics_id:</strong> Track user interactions for service improvement</li>
                    <li><strong>page_views:</strong> Count page visits and popular content</li>
                    <li><strong>user_journey:</strong> Understand user navigation patterns</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Functional Cookies</h3>
                <p className="text-muted-foreground mb-3">These cookies enhance your experience on our Service:</p>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <li><strong>region_filter:</strong> Remember selected region/country filters</li>
                    <li><strong>dashboard_layout:</strong> Save dashboard customization preferences</li>
                    <li><strong>notification_settings:</strong> Store notification preferences</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">🔧 Managing Your Cookie Preferences</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Cookie Consent Banner</h3>
              <p className="text-muted-foreground">When you first visit our Service:</p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• You'll see a cookie consent banner</li>
                <li>• You can accept all cookies or customize your preferences</li>
                <li>• Essential cookies cannot be disabled as they're necessary for Service functionality</li>
                <li>• You can change your preferences at any time</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium">Browser Settings</h3>
              <p className="text-muted-foreground mb-3">You can also manage cookies through your browser settings:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Google Chrome</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Click Menu → Settings → Privacy and security</li>
                    <li>2. Click "Cookies and other site data"</li>
                    <li>3. Choose your preferred cookie setting</li>
                  </ol>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Mozilla Firefox</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Click Menu → Settings → Privacy & Security</li>
                    <li>2. Under "Cookies and Site Data"</li>
                    <li>3. Choose your preferences</li>
                  </ol>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Safari</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Click Safari → Preferences → Privacy</li>
                    <li>2. Choose your cookie and tracking preferences</li>
                    <li>3. Manage website data</li>
                  </ol>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Microsoft Edge</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Click Menu → Settings</li>
                    <li>2. Click "Cookies and site permissions"</li>
                    <li>3. Choose your cookie preferences</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">⚠️ Consequences of Disabling Cookies</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Essential Cookies</h3>
                <p className="text-sm text-muted-foreground mb-2">Disabling essential cookies will:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Prevent proper Service functionality</li>
                  <li>• Require repeated login attempts</li>
                  <li>• Reset preferences on each visit</li>
                  <li>• May break critical features</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Non-Essential Cookies</h3>
                <p className="text-sm text-muted-foreground mb-2">Disabling non-essential cookies may:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Reduce personalization features</li>
                  <li>• Affect analytics and improvement efforts</li>
                  <li>• Limit some convenience features</li>
                  <li>• Not impact core Service functionality</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">🔒 Data Protection and Privacy</h2>
            
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Personal Data in Cookies</h3>
              <p className="text-muted-foreground mb-3">Most of our cookies do not contain personal data:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Session identifiers are randomized and not personally identifiable</li>
                <li>• Preferences contain settings, not personal information</li>
                <li>• Analytics data is aggregated and anonymized</li>
                <li>• Any personal data in cookies is encrypted</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">🌍 International Transfers</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Some third-party services may transfer cookie data internationally. We ensure adequate protection through appropriate safeguards and regularly review third-party compliance with data protection laws.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">⚖️ Legal Basis for Cookie Use</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">GDPR Compliance</h3>
                <p className="text-sm text-muted-foreground mb-2">Under GDPR, we use cookies based on:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Consent:</strong> For non-essential cookies</li>
                  <li><strong>Legitimate Interest:</strong> For analytics that help improve our Service</li>
                  <li><strong>Contractual Necessity:</strong> For essential cookies required for Service delivery</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Other Jurisdictions</h3>
                <p className="text-sm text-muted-foreground mb-2">We comply with applicable laws in:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ePrivacy Directive (EU)</li>
                  <li>• California Consumer Privacy Act (CCPA)</li>
                  <li>• Personal Information Protection Act (PIPEDA)</li>
                  <li>• Local data protection and privacy laws</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">📞 Contact Information</h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg space-y-3">
              <p className="text-sm">For questions about our use of cookies:</p>
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
              <strong>⚠️ Last Updated:</strong> This Cookie Policy is designed to provide transparency about our cookie practices while ensuring compliance with applicable privacy and data protection laws. For personalized legal advice, consult with qualified legal counsel.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}