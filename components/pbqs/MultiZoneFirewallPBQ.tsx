
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const MultiZoneFirewallPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="multi_zone_firewall"
      title="Multi-Zone Firewall Configuration"
      scenario="Configure firewall rules for a network with an Intranet, DMZ, and the Internet."
      objective="Determine the correct traffic flow for each zone."
      questions={[
        {
          id: "q1",
          text: "Traffic from the Internet to the Web Server in the DMZ should be:",
          options: [
            { value: "Allowed", label: "Allowed on Port 80/443" },
            { value: "Denied", label: "Denied completely" },
            { value: "Allowed All", label: "Allowed on all ports" },
            { value: "Restricted", label: "Restricted to VPN only" }
          ],
          correctValue: "Allowed",
          feedback: "Public web servers in the DMZ must accept HTTP/HTTPS traffic from the internet."
        },
        {
          id: "q2",
          text: "Traffic from the DMZ Web Server to the Internal Database Server (Intranet) should be:",
          options: [
            { value: "Allowed Specific", label: "Allowed only on DB port (e.g., 1433/3306)" },
            { value: "Allowed All", label: "Allowed on all ports" },
            { value: "Denied", label: "Denied completely" },
            { value: "Internet Only", label: "Routed via Internet" }
          ],
          correctValue: "Allowed Specific",
          feedback: "The DMZ should only access internal resources on specific, necessary ports to limit lateral movement."
        },
        {
          id: "q3",
          text: "Traffic from the Internet directly to the Internal Database Server should be:",
          options: [
            { value: "Denied", label: "Denied" },
            { value: "Allowed", label: "Allowed" },
            { value: "Logged", label: "Allowed and Logged" },
            { value: "Filtered", label: "Filtered by IP" }
          ],
          correctValue: "Denied",
          feedback: "Direct access from the Internet to the internal network (Intranet) should always be blocked."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default MultiZoneFirewallPBQ;
