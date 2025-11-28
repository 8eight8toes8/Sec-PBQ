
from playwright.sync_api import sync_playwright, expect

def verify_pki_pbq():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app (preview port)...")
            page.goto("http://localhost:4173")
            page.wait_for_selector(".min-h-screen", state="visible")

            print("Looking for Advanced tab...")
            page.get_by_role("button", name="Advanced").first.click()

            print("Launching PKI module...")
            # Find the card container
            card = page.locator("div.bg-white.rounded-xl").filter(has_text="PKI & Certificate Management").first
            card.click()

            print("Waiting for PKI Dashboard...")
            expect(page.locator("h2", has_text="PKI Manager")).to_be_visible()

            # Task 1: Revoke Compromised Cert (dev-server.cloud)
            print("Revoking compromised cert...")
            # Find the row with dev-server.cloud
            row = page.locator("tr", has_text="dev-server.cloud")
            # Click Revoke button (ban icon) within that row
            row.locator("button[title='Revoke Certificate']").click()
            # Verify feedback
            expect(page.get_by_text("Success: Compromised certificate has been added to the CRL")).to_be_visible()

            # Task 2: Renew Expiring Cert (vpn.secure-bank.com)
            print("Renewing expiring cert...")
            row = page.locator("tr", has_text="vpn.secure-bank.com")
            row.locator("button[title='Renew Certificate']").click()
            expect(page.get_by_text("Success: Certificate renewed successfully")).to_be_visible()

            # Task 3: Issue New Cert (mail.secure-bank.com)
            print("Issuing new cert...")
            page.get_by_role("button", name="New Certificate Request").click()

            # Fill CSR Form
            page.fill("input[placeholder='e.g., mail.secure-bank.com']", "mail.secure-bank.com")
            page.fill("input[placeholder='e.g., Secure Bank Ltd.']", "Secure Bank Ltd.")

            # Submit
            page.get_by_role("button", name="Sign & Install").click()
            expect(page.get_by_text("Success: CSR Signed")).to_be_visible()

            # Validate Completion
            print("Validating completion...")
            page.get_by_role("button", name="Validate & Finish").click()

            # In the real app, this might just close or show a score.
            # Our component calls onComplete(100) if successful.
            # We can check if the dashboard reflects the completed status or if the module closes (if onComplete closes it, but here onComplete updates score).
            # The component doesn't show a "Mission Complete" modal overlay itself in the code I wrote,
            # but usually the wrapper handles it or the feedback text changes?
            # Wait, `checkCompletion` sets feedback to "Incomplete" if not done.
            # If done, it calls onComplete. The parent component usually handles closing or showing a global success.
            # However, looking at the code:
            # if (tasksCompleted.revoked && ...) onComplete(100);
            # else setFeedback("Incomplete...");

            # Since we can't easily check the parent state, let's verify we DON'T see "Incomplete".
            expect(page.get_by_text("Incomplete: You still have pending tasks")).not_to_be_visible()

            print("PKI Module Verified")
            page.screenshot(path="verification/pki_verified.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_pki.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_pki_pbq()
