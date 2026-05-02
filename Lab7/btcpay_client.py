import requests
import json
import sys
import time
import bolt11
from datetime import datetime    
from btcpay_api_error import BTCPayAPIError

class BTCPayClient:
    """
    Client for interacting with the BTCPay Server API (Greenfield v1).
    """
    def __init__(self, api_key: str, store_id: str, btcpay_url: str = "https://testnet.demo.btcpayserver.org"):
        """
        Initializes the client.

        Args:
            api_key (str): Access Token type API key from BTCPay Server.
            store_id (str): The Store ID in BTCPay Server.
            btcpay_url (str, optional): Base URL of the BTCPay Server instance.
                                        Defaults to the testnet demo server.
        """
        if not api_key or not store_id:
            raise ValueError("API key and Store ID must be provided.")
        self.api_key = api_key
        self.store_id = store_id
        self.base_url = btcpay_url.rstrip('/')
        self._session = requests.Session()
        self._session.headers.update({
            "Authorization": f"token {self.api_key}",
            "Content-Type": "application/json"
        })

    def _make_request(self, method: str, endpoint: str, **kwargs) -> dict | list:
        """
        Internal method for making API requests.

        Args:
            method (str): HTTP method (GET, POST, etc.).
            endpoint (str): API endpoint (path after base URL).
            **kwargs: Additional arguments for requests (e.g., json for POST, params for GET).

        Returns:
            dict | list: JSON response from the server.

        Raises:
            BTCPayAPIError: If the API returns an error or a connection problem occurs.
        """
        full_url = f"{self.base_url}{endpoint}"
        try:
            response = self._session.request(method, full_url, **kwargs)
            response.raise_for_status()

            if response.status_code == 204 or not response.content:
                return {}
            return response.json()
        except requests.exceptions.HTTPError as e:
            error_message = f"HTTP error calling {full_url}"
            response_text = e.response.text
            status_code = e.response.status_code
            try:
                error_data = e.response.json()
                if isinstance(error_data, dict) and 'message' in error_data:
                    error_message = error_data['message']
            except json.JSONDecodeError:
                pass
            raise BTCPayAPIError(error_message, status_code=status_code, response_text=response_text) from e
        except requests.exceptions.RequestException as e:
            raise BTCPayAPIError(f"Connection error calling {full_url}: {e}") from e
        except json.JSONDecodeError as e:
             raise BTCPayAPIError(f"Error decoding JSON response from {full_url}: {e}")


    def get_store_info(self) -> dict:
        """Gets information about the configured store."""
        endpoint = f"/api/v1/stores/{self.store_id}"
        print(f"\nFetching store information from: {self.base_url}{endpoint}")
        try:
            return self._make_request("GET", endpoint)
        except BTCPayAPIError as e:
            print(f"\nError fetching store information: {e}")
            return {}

    def create_invoice(self, amount: float | str, currency: str = "SATS", description: str = "", order_id: str | None = None, payment_methods: list | None = None) -> dict:
        """Creates a new invoice."""
        endpoint = f"/api/v1/stores/{self.store_id}/invoices"
        payload = {
            "amount": amount,
            "currency": currency,
        }

        metadata = {}
        if description:
            metadata["itemDesc"] = description
        if order_id:
            metadata["orderId"] = order_id
        if metadata:
            payload["metadata"] = metadata
        if payment_methods:
            payload["paymentMethods"] = payment_methods

        return self._make_request("POST", endpoint, json=payload)

        
    def list_invoices(self, statuses: list = None, order_id: str = None, limit: int = 100, skip: int = 0) -> list:
        """Retrieves a list of invoices, optionally filtered."""
        endpoint = f"/api/v1/stores/{self.store_id}/invoices"
        params = {
            "limit": limit,
            "skip": skip,
        }
        if statuses:
            params["status"] = statuses
        if order_id:
            params["orderId"] = order_id

        response = self._make_request("GET", endpoint, params=params)
        return response if isinstance(response, list) else []
    
    def get_invoice_details(self, invoice_id: str) -> dict:
        """Gets basic details for an existing invoice."""
        endpoint = f"/api/v1/stores/{self.store_id}/invoices/{invoice_id}"
        response = self._make_request("GET", endpoint)
        return response if isinstance(response, dict) else {}

    def get_invoice_payment_methods(self, invoice_id: str) -> list:
        """Gets detailed payment method information for a specific invoice."""
        endpoint = f"/api/v1/stores/{self.store_id}/invoices/{invoice_id}/payment-methods"
        response = self._make_request("GET", endpoint)
        return response if isinstance(response, list) else []

    def get_lightning_invoice(self, invoice_id: str) -> str | None:
        """ Retrieves the BOLT11 string (LN invoice) for a given BTCPay invoice ID. """
        payment_methods = self.get_invoice_payment_methods(invoice_id)
        for method in payment_methods:
            if method.get("paymentMethodId") != "BTC-LN":
                continue

            payment_link = method.get("paymentLink", "")
            if not payment_link:
                continue

            if payment_link.lower().startswith("lightning:"):
                return payment_link.split(":", 1)[1]
            return payment_link

        return None

    @staticmethod
    def decode_bolt11(bolt11_invoice: str):
        """Decodes a BOLT11 string using the bolt11 library and prints details."""
        if not bolt11_invoice:
            print("No BOLT11 invoice to decode.")
            return None

        try:
            decoded = bolt11.decode(bolt11_invoice)

            amount_msat = decoded.amount_msat
            amount_sats = int(amount_msat) / 1000 if amount_msat is not None else None

            print("\nDecoded BOLT11 details:")
            print(f"  Amount (sats): {amount_sats if amount_sats is not None else 'N/A'}")
            print(f"  Description: {decoded.description or 'N/A'}")
            print(f"  Payment hash: {decoded.payment_hash or 'N/A'}")
            print(f"  Expiry (seconds): {decoded.expiry}")
            print(f"  Payee pubkey: {decoded.payee or 'N/A'}")

            return decoded
        except Exception as e:
            print(f"Failed to decode BOLT11 invoice: {e}")
            return None
        

    def get_invoice_status(self, invoice_id: str) -> str | None:
        """Gets the current status of an invoice."""
        details = self.get_invoice_details(invoice_id)
        return details.get("status") if details else None

    def check_invoice_paid(self, invoice_id: str) -> bool:
        """Checks if an invoice is paid (status is 'Settled')."""
        status = self.get_invoice_status(invoice_id)
        return status == "Settled"