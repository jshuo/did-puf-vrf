"use client";

import Head from "next/head";
import Image from "next/image";
import { Account } from "../../components/Account";

export default function CallToActions() {

  return (
    <div>
      <Head>
        <title>Call to Actions</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Call to Actions</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-4xl mb-2">
              <h2>
                <b>Call to Actions</b> <p></p> <Account />
              </h2>
              <p></p>
              <hr />

              <ul className="list-disc" style={{ marginLeft: '20px' }}>

                <li style={{ marginBottom: '20px' }}> DID-PUF Proof of Business (Supply Chain, Taiwan Ballot) Grant - AI Assisted MODA 2025</li>
                <li style={{ marginBottom: '20px' }}> RWA STO(Fund Raising) Proof of Concept Grant/ NRE - Taiwan/Japan/Korea Small Business</li>
                <li style={{ marginBottom: '20px' }}> PUF-HSM for RWA Investor Account</li>

              </ul>
              <hr />

            </span>
          </h2>
        </div>

        <hr />

        <br />
      </main>
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <Image src="/cta-1.png" alt="Example Image" width={800} height={600} />
        <Image src="/cta-2.png" alt="Example Image" width={800} height={600} />
      </div>

    </div>
  );
}


// return (
//   <div>

//     <main>

//       <div className="px-5">

//         <p></p>
//         <span className="block text-2xl font-bold">
//          1. Battery-Free Smart Tags
//         </span>
//         <p></p> <span className="block text-2xl font-bold">2. To engage with issuers, delegate Signer (if USB)</span> <p></p>
//         <span className="block text-2xl font-bold">3. Showcases to blockchain developer communities</span> <p></p>
//         <span className="block text-2xl font-bold">4. To partnership with Tokeny ERC3643</span> <p></p>
//        <span className="block text-2xl font-bold">
//           5. Machine Learning Verifiable Claims with cryptographic signatures Verification
//         </span>
//         <p>

//           Yes, the idea of using machine learning (ML) to assess the content of verifiable claims, while relying on
//           cryptographic methods to verify their signatures, is indeed a brilliant concept with significant business
//           potential. Here’s why:
//         </p>
//         <h2>Why It’s a Brilliant Idea</h2> <h3>Enhanced Efficiency:</h3>
//         <ul>

//           <li>

//             Automation of Content Verification: By leveraging ML, the process of verifying the content of claims can
//             be largely automated, reducing the need for manual intervention and speeding up the verification process.
//           </li>
//           <li>

//             Scalability: ML models can handle large volumes of data and claims, making the system scalable as the
//             number of claims grows.
//           </li>
//         </ul>
//         <h3>Improved Accuracy and Consistency:</h3>
//         <ul>

//           <li>

//             Data-Driven Insights: ML models can analyze vast amounts of historical data to identify patterns and
//             anomalies that might be missed by human reviewers.
//           </li>
//           <li>

//             Consistency: Unlike human reviewers, ML models apply the same criteria and logic consistently, leading to
//             more reliable verification outcomes.
//           </li>
//         </ul>
//         <h3>Cost Reduction:</h3>
//         <ul>

//           <li>

//             Reduced Labor Costs: Automating the content verification process can significantly reduce labor costs
//             associated with manual review.
//           </li>
//           <li>

//             Operational Efficiency: Faster and more accurate verification processes can lead to overall operational
//             efficiencies and cost savings.
//           </li>
//         </ul>
//         <h3>Fraud Detection:</h3>
//         <ul>

//           <li>

//             Proactive Fraud Prevention: ML can detect subtle patterns indicative of fraud that might not be
//             immediately obvious, enhancing the security and trustworthiness of the verification process.
//           </li>
//         </ul>
//         <h3>Enhanced User Experience:</h3>
//         <ul>

//           <li>

//             Speed: Faster verification processes improve user experience, making systems more attractive to users and
//             stakeholders.
//           </li>
//           <li>Trust: Reliable and consistent verification builds trust with users and clients.</li>
//         </ul>
//         <h2>Business Potential</h2> <h3>Market Demand:</h3>
//         <ul>

//           <li>

//             Digital Identity Verification: With the rise of digital transactions and remote services, there is
//             increasing demand for robust digital identity verification systems.
//           </li>
//           <li>

//             Regulatory Compliance: Regulatory requirements for identity verification and fraud prevention are becoming
//             more stringent, creating a need for advanced verification technologies.
//           </li>
//         </ul>
//         <h3>Applications Across Industries:</h3>
//         <ul>

//           <li>Education: Verifying academic credentials and certifications.</li>
//           <li>Healthcare: Validating professional qualifications and medical records.</li>
//           <li>Finance: Streamlining KYC (Know Your Customer) processes and credit history verification.</li>
//           <li>Employment: Checking employment history and professional credentials.</li>
//         </ul>
//         <h3>Competitive Advantage:</h3>
//         <ul>

//           <li>

//             Innovation: Companies adopting ML for content verification can position themselves as innovators and
//             leaders in their industries.
//           </li>
//           <li>

//             Differentiation: Offering faster, more reliable verification services can be a key differentiator in
//             competitive markets.
//           </li>
//         </ul>
//         <h3>New Business Models:</h3>
//         <ul>

//           <li>

//             Verification as a Service: Companies could offer verification services to other businesses (B2B), creating
//             new revenue streams.
//           </li>
//           <li>

//             Data Insights: Leveraging data collected through the verification process to offer additional insights and
//             analytics services.
//           </li>
//         </ul>
//         <h2>Potential Challenges and Mitigation</h2> <h3>Data Privacy and Security:</h3>
//         <ul>

//           <li>

//             Challenge: Ensuring that personal data used in the verification process is handled securely and in
//             compliance with privacy regulations.
//           </li>
//           <li>

//             Mitigation: Implement robust encryption, access controls, and compliance with data protection laws (e.g.,
//             GDPR, CCPA).
//           </li>
//         </ul>
//         <h3>Bias and Fairness:</h3>
//         <ul>

//           <li>Challenge: ML models can inadvertently learn and propagate biases present in training data.</li>
//           <li>

//             Mitigation: Regularly audit models for biases, use diverse training datasets, and implement fairness
//             checks.
//           </li>
//         </ul>
//         <h3>Model Accuracy and Reliability:</h3>
//         <ul>

//           <li>Challenge: Ensuring that ML models maintain high accuracy and reliability over time.</li>
//           <li>

//             Mitigation: Continuous model monitoring, retraining with new data, and incorporating feedback loops from
//             human reviewers.
//           </li>
//         </ul>
//         <p>

//           Conclusion: Using ML to assess the content of verifiable claims, coupled with cryptographic verification of
//           signatures, is a highly promising idea with substantial business potential. It addresses key challenges in
//           the verification process, offering efficiency, accuracy, and scalability. By capitalizing on this approach,
//           businesses can gain a competitive edge, meet growing market demands, and explore new revenue opportunities.
//         </p>
//         <hr />
//       </div>
//     </main>
//     <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">

//       <Image src="/cfa-2.png" alt="Example Image" width={800} height={600} />
//       <Image src="/cfa-1.png" alt="Example Image" width={800} height={600} />
//     </div>
//   </div>
// );