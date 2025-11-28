
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const DDoSMitigationPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="ddos_mitigation"
      title="DDoS Mitigation Strategy"
      scenario="Your web application is under a Distributed Denial of Service (DDoS) attack. Choose the correct mitigation techniques."
      objective="Select the appropriate defense for the type of DDoS attack."
      questions={[
        {
          id: "q1",
          text: "Attackers are flooding your network link with UDP packets (Volumetric Attack). What is the best upstream mitigation?",
          options: [
            { value: "Scrubbing", label: "DDoS Scrubbing Center / Cloud Protection" },
            { value: "Local Firewall", label: "Local Firewall Rule" },
            { value: "Reboot", label: "Reboot the router" },
            { value: "IPS", label: "On-premise IPS" }
          ],
          correctValue: "Scrubbing",
          feedback: "Volumetric attacks often exceed local link capacity; upstream scrubbing centers can absorb the traffic."
        },
        {
          id: "q2",
          text: "Your web server is receiving thousands of slow, partial HTTP requests (Slowloris). What defense helps?",
          options: [
            { value: "Timeouts", label: "Aggressive Connection Timeouts / Rate Limiting" },
            { value: "Bandwidth", label: "Increasing Bandwidth" },
            { value: "Packet Filter", label: "Packet Filtering" },
            { value: "Backup", label: "Restoring from Backup" }
          ],
          correctValue: "Timeouts",
          feedback: "Slowloris holds connections open; limiting connection time and rate helps free up resources."
        },
        {
          id: "q3",
          text: "To hide your origin server's IP address from attackers, you should use:",
          options: [
            { value: "CDN", label: "Content Delivery Network (CDN) / Reverse Proxy" },
            { value: "DNS", label: "Dynamic DNS" },
            { value: "VLAN", label: "VLAN Tagging" },
            { value: "Port Forwarding", label: "Port Forwarding" }
          ],
          correctValue: "CDN",
          feedback: "A CDN fronts your traffic, masking the direct IP of your origin server."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default DDoSMitigationPBQ;
