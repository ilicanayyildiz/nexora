import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Nexora",
  description: "Terms of Service for Nexora NFT marketplace and creator platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="space-y-8 text-white/80 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Introduction</h2>
          <p>
            Welcome to Nexora (hereinafter also &quot;Nexora&quot;, &quot;we/us/our&quot;). Nexora offers a software as a service solution, 
            hereinafter referred to as the &quot;Software&quot; through our platform (&quot;Platform&quot;). The Software and Platform are 
            hereinafter jointly be referred to as our &quot;Services&quot;.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">1. Definitions</h2>
          <div className="space-y-3">
            <p><strong>1.1 User(s):</strong> individual person(s) (natural persons) or legal entity(ies) making use of the Services. Also referred to as &quot;you&quot;.</p>
            <p><strong>1.2 Software:</strong> the Software enables Users, including artists (&quot;Artists&quot;) and collectors (&quot;Collectors&quot;), to use the Platform to sell, purchase, create, list for auction, make offers on, and bid on (each a &quot;Transaction&quot;) NFT&apos;s. The Software also includes a launchpad (&quot;Launchpad&quot;). The Launchpad enables Users to purchase upcoming, not yet launched, NFT&apos;s.</p>
            <p><strong>1.3 Platform:</strong> a distributed application, functioning as a marketplace, that runs on a blockchain network, using specially-developed smart contracts that provide an immutable ledger of all transactions that occur on the Nexora marketplace (&quot;Smart Contracts&quot;). Using these Smart Contracts, users can create, buy, transfer and trade unique digital asset(s) as in the form of an NFT.</p>
            <p><strong>1.4 Account:</strong> the Account on the Platform created by User, which is limited for use by User only through the Login Credentials.</p>
            <p><strong>1.5 NFT(&apos;s):</strong> a non-fungible token or similar digital item implemented on a blockchain (such as the Ethereum or Polygon blockchain), which uses smart contracts to link to or otherwise be associated with certain content or data.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">2. User Login</h2>
          <p>
            2.1 Users can browse the Platform without registering for an account. In order to participate on the Platform, 
            you must connect your account to your digital wallet supported on MetaMask, WalletConnect or other wallet 
            extensions or gateways as on the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">3. Transactions and Fees</h2>
          <div className="space-y-3">
            <p>
              3.1 If a User purchases, sells, trades or creates an NFT on the Software, or with or from other users via 
              the Software any financial transactions that you engage in will be conducted solely through a blockchain 
              network (for example blockchain network Ethereum or Polygon) via MetaMask (or other Ethereum-compatible 
              wallets and browsers). We have no insight into or control over these payments or transactions, nor do we 
              have the ability to reverse any transactions.
            </p>
            <p>
              3.2 A blockchain network requires the payment of a transaction fee (a "Gas Fee") for every transaction 
              that occurs on the blockchain network. The Gas Fee funds the network of computers that run the 
              decentralized blockchain network. This means that you will need to pay a Gas Fee for each transaction 
              that occurs via the Software.
            </p>
            <p>
              3.3 In addition to the Gas Fee, each time you utilise a smart contract to conduct a purchase transaction 
              with another user via the App, you authorise us to collect: a commission of 2.5% of the total value of 
              that transaction (the "Fee"). You acknowledge and agree that the Fee will be transferred directly to us 
              through the blockchain network as part of your payment.
            </p>
            <p>
              3.4 You are responsible for all taxes related to your sales and purchases by using the Services.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">4. Fair Use of the Services</h2>
          <div className="space-y-3">
            <p>
              4.1 You agree that you will use the Services as it is intended and that you not use the Services in such 
              a way that you breach any applicable law and regulations.
            </p>
            <p>
              4.2 You agree that you will not, nor allow third parties, unless explicit written permission has been 
              granted by Nexora, to engage in, but not limited to, the following actions:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>engage in deceptive or manipulative trading activities in any way, including bidding on your own items, preventing bidding, placing misleading bids or offers, or using the Platform to conceal economic activity;</li>
              <li>email, upload, or otherwise distribute any content, that (i) infringes any intellectual property or other proprietary rights of any part;</li>
              <li>harvest or collect email addresses or other contact information of other Users from the Platform by electronic or other means for the purposes of sending unsolicited emails or other unsolicited communications;</li>
              <li>access or use the Platform to carry out financial activities subject to registration or licensing, including but not limited to creating, listing, or buying securities, commodities, options, real estate, or debt instruments;</li>
              <li>circumvent, disable, enter, damage or otherwise interfere with any non-public and/or security features or parts of the Services;</li>
              <li>send, upload or otherwise distribute viruses, worms, malicious code, spider, robot, junk mail, spam, chain letters, unsolicited offers or ads of any kind and for any purpose into the Services;</li>
              <li>investigate, scan, or test the Services or any related system on any securities issues;</li>
              <li>use any automated systems to withdraw data from the Services;</li>
              <li>sell, distribute, copy, rent, sub-license, loan, merge, reproduce, alter, modify, reverse engineer, disassemble, decompile, transfer, exchange, hack, distribute, harm or misuse the Services;</li>
              <li>create derivative works of any kind whatsoever.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">5. Availability and Maintenance of the Services</h2>
          <div className="space-y-3">
            <p>
              5.1 Nexora uses all reasonable efforts to ensure that you can access and use the Services at all times. 
              Due to the nature of the Services, Nexora cannot guarantee the error-free and uninterrupted access to/and 
              functioning of the Services.
            </p>
            <p>
              5.2 Nexora does not accept any responsibility for unavailability of the Services, any difficulty or 
              inability to download or access content, or any other technology system failure which may result in 
              Services being partially or entirely unavailable.
            </p>
            <p>
              5.3 Nexora may - at its own discretion - update, modify, or adapt the Services functionalities from time 
              to time and shall try to keep possible downtime of the Services to a minimum. Nexora is not responsible 
              for any support or maintenance regarding the Services during downtime.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">6. Privacy</h2>
          <p>
            6.1 In our privacy policy, you can read what kind of personal data we collect and why. Please familiarize 
            yourself with our privacy policy at our website. By using the Services, you agree to these privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">7. Intellectual Property Rights</h2>
          <div className="space-y-3">
            <p>
              7.1 The Artist owns all legal rights, title, and interest in all intellectual property rights of the 
              content underlying the NFT minted by the Artist on the Platform (such underlying content, the "Creative Material") 
              and any content specific to a Collection that is not the NFT within a Collection ("Collection Material"), 
              including but not limited to copyrights and trademarks in the Creative Material and Collection Material.
            </p>
            <p>
              7.2 The Artist acknowledges, and agrees that selling such NFT on the Platform constitutes an express 
              representation, warranty, and covenant that the Artist (a) has not sold, tokenized or created another 
              cryptographic token, and (b) will not, and will not cause another to, sell, tokenize, or create another 
              cryptographic token, in each case representing a digital collectible for the same Creative Material 
              underlying such NFT.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">8. Risks and Disclaimers</h2>
          <div className="space-y-3">
            <p>
              8.1 You acknowledge and agree that there are numerous risks associated with purchasing, holding, and using 
              NFTs, including but not limited to the risk of losing access to NFTs due to loss of private keys, custodial 
              error or purchaser error, smart contract error, or the risk of mining attacks.
            </p>
            <p>
              8.2 The prices of blockchain assets are extremely volatile and subjective. Blockchain assets have no inherent 
              or intrinsic value. Each blockchain asset has no value more than that which a purchaser is willing to pay 
              for it at the time of sale.
            </p>
            <p>
              8.3 There are risks associated with using Internet and blockchain based products, including, but not limited 
              to, the risk of hardware, software and Internet connections, the risk of malicious software introduction, 
              and the risk that third parties may obtain unauthorized access to information stored within your wallet.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">9. No Financial Advice</h2>
          <p>
            9.1 The information provided in the Services does not constitute investment advice, financial advice, trading 
            advice, or any other sort of advice. You should not treat any of the Services content as such. Nexora does not 
            recommend that any NFT or cryptocurrency should be bought, sold, or held by you. Nothing in the Services should 
            be taken as an offer to buy, sell or hold a cryptocurrency or NFT.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">10. Limitation of Liability</h2>
          <p>
            10.1 To the fullest extent permitted by applicable law, Nexora shall not be liable for any indirect, incidental, 
            special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or 
            indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use of the Services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">11. Contact</h2>
          <p>
            11.1 Questions about these Terms can be sent to support@nexora.com
          </p>
          <p className="text-sm text-white/60 mt-4">
            Last update: {new Date().toLocaleDateString()}
          </p>
        </section>
      </div>
    </div>
  );
}
