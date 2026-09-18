import { LegalPage } from '../components/LegalPage'

export function TermsAndConditions() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="September 2026"
      sections={[
        {
          heading: 'Who We Are',
          body: ['Araku Tribe sells ethically sourced coffee and merchandise online, sourced from farming communities in the Araku Valley.'],
        },
        {
          heading: 'Eligibility',
          body: ['You must be able to form a legally binding contract to create an account or place an order with us.'],
        },
        {
          heading: 'Accounts',
          body: [
            'You are responsible for keeping your account credentials confidential and for all activity that occurs under your account. Sign-in requires verifying a one-time code sent to your email.',
          ],
        },
        {
          heading: 'Orders and Pricing',
          body: [
            'All prices are shown in US dollars and are subject to change without notice. We reserve the right to limit quantities and to refuse or cancel any order, including for pricing errors or suspected fraud.',
          ],
        },
        {
          heading: 'Payments',
          body: ['We accept the payment methods shown at checkout. Cash on Delivery orders are marked as pending payment until collected.'],
        },
        {
          heading: 'Shipping and Delivery',
          body: ['Delivery timelines are estimates and may vary based on location and order volume.'],
        },
        {
          heading: 'Cancellations, Returns, and Refunds',
          body: [
            'Orders can be cancelled from your account while they are still processing. Once an order has shipped, cancellation may no longer be available.',
          ],
        },
        {
          heading: 'Intellectual Property',
          body: ['All branding, product photography, and site content is owned by Araku Tribe and may not be reused without permission.'],
        },
        {
          heading: 'Prohibited Conduct',
          body: ['You agree not to misuse the site, attempt to access accounts that are not yours, or interfere with the normal operation of the service.'],
        },
        {
          heading: 'Third-Party Links',
          body: ['Our site may link to third-party sites we do not control and are not responsible for.'],
        },
        {
          heading: 'Disclaimers',
          body: ['Our products and services are provided "as is" without warranties of any kind, to the fullest extent permitted by law.'],
        },
        {
          heading: 'Limitation of Liability',
          body: ['To the extent permitted by law, Araku Tribe is not liable for indirect or consequential damages arising from use of the site or products.'],
        },
        {
          heading: 'Indemnification',
          body: ['You agree to indemnify Araku Tribe against claims arising from your misuse of the site or violation of these terms.'],
        },
        {
          heading: 'Changes',
          body: ['We may update these terms from time to time; continued use of the site after a change constitutes acceptance of the new terms.'],
        },
        {
          heading: 'Governing Law',
          body: ['These terms are governed by the laws of the jurisdiction in which Araku Tribe operates.'],
        },
        {
          heading: 'Contact Us',
          body: ['Questions about these terms can be sent to info@arakutribe.com or via our Contact page.'],
        },
      ]}
    />
  )
}
