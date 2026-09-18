import { LegalPage } from '../components/LegalPage'

export function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 2026"
      sections={[
        {
          heading: 'Information We Collect',
          body: [
            'When you create an account, place an order, or contact us, we collect information such as your name, email address, phone number, shipping address, and order history.',
            'We also collect basic technical information (like browser type and IP address) automatically when you use our site, to help keep it secure and working correctly.',
          ],
        },
        {
          heading: 'How We Use It',
          body: [
            'We use your information to process orders, manage your account, respond to support requests, and send order-related communications such as OTPs and order confirmations.',
            'We do not use your personal information for purposes unrelated to operating the store without your consent.',
          ],
        },
        {
          heading: 'How We Share It',
          body: [
            'We share order information with the service providers needed to fulfil it (such as payment processing and delivery). We do not sell your personal information to third parties.',
          ],
        },
        {
          heading: 'Cookies',
          body: [
            'We use essential cookies to keep you signed in and to complete multi-step flows like OTP verification. We do not use third-party advertising or tracking cookies.',
          ],
        },
        {
          heading: 'Data Retention',
          body: [
            'We retain your account and order data for as long as your account is active, or as needed to comply with our legal obligations, resolve disputes, and enforce our agreements.',
          ],
        },
        {
          heading: 'Your Rights',
          body: [
            'You can view and update your profile information at any time from your account settings, and you can request deletion of your account, as described in our Account Deletion Terms.',
          ],
        },
        {
          heading: 'Data Security',
          body: [
            'Passwords are stored using industry-standard hashing, and sign-in relies on one-time codes rather than storing long-lived credentials in the browser. No method of transmission or storage is 100% secure, but we work to protect your information using reasonable safeguards.',
          ],
        },
        {
          heading: "Children's Privacy",
          body: [
            'Our services are not directed to children under 16, and we do not knowingly collect personal information from children.',
          ],
        },
        {
          heading: 'International Users',
          body: [
            'If you access our site from outside the country where our servers are located, your information may be processed in a different jurisdiction than your own.',
          ],
        },
        {
          heading: 'Changes to This Policy',
          body: [
            'We may update this policy from time to time. Material changes will be reflected by updating the date at the top of this page.',
          ],
        },
        {
          heading: 'Contact Us',
          body: [
            'Questions about this policy can be sent to info@arakutribe.com or via our Contact page.',
          ],
        },
      ]}
    />
  )
}
