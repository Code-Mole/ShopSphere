import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";
import { orderService, addressService } from "../services/order.service.js";
import Spinner from "../components/ui/Spinner.jsx";
import Alert from "../components/ui/Alert.jsx";

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Ahafo",
  "Bono East",
  "Oti",
  "Savannah",
  "North East",
  "Western North",
];

const DELIVERY_OPTIONS = [
  {
    value: "standard",
    label: "Standard Delivery",
    desc: "3–5 business days",
    fee: 15,
  },
  {
    value: "express",
    label: "Express Delivery",
    desc: "1–2 business days",
    fee: 35,
  },
];

export default function Checkout() {
  const { cart, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: GHANA_REGIONS[0],
  });
  const [deliveryOption, setDeliveryOption] = useState("standard");

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    addressService
      .getAddresses()
      .then(({ data }) => {
        setSavedAddresses(data.data);
        if (data.data.length > 0) {
          const def = data.data.find((a) => a.isDefault) || data.data[0];
          setSelectedAddressId(def._id);
          setUseNewAddress(false);
        }
      })
      .catch(() => {});
  }, []);

  const shippingFee =
    DELIVERY_OPTIONS.find((d) => d.value === deliveryOption)?.fee || 0;
  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    if (!useNewAddress) return true; // using saved address — already valid
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!form.phone.trim()) errs.phone = "Required";
    if (!form.addressLine1.trim()) errs.addressLine1 = "Required";
    if (!form.city.trim()) errs.city = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data } = await orderService.validateCoupon(
        couponCode.trim(),
        subtotal,
      );
      setCoupon(data.data);
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon.");
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    let shippingAddress;
    if (useNewAddress) {
      shippingAddress = { ...form, country: "Ghana" };
    } else {
      const addr = savedAddresses.find((a) => a._id === selectedAddressId);
      if (!addr) {
        setAlert({
          type: "error",
          message: "Please select a shipping address.",
        });
        return;
      }
      shippingAddress = {
        fullName: addr.fullName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        region: addr.region,
        country: addr.country,
      };
    }

    setLoading(true);
    setAlert({ type: "", message: "" });
    try {
      const { data } = await orderService.checkout({
        shippingAddress,
        deliveryOption,
        couponCode: coupon?.code || undefined,
      });

      // Redirect to Paystack's hosted checkout page
      window.location.href = data.data.authorizationUrl;
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err.response?.data?.message || "Checkout failed. Please try again.",
      });
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>

            {savedAddresses.length > 0 && (
              <div className="space-y-2 mb-4">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      !useNewAddress && selectedAddressId === addr._id
                        ? "border-primary-400 bg-primary-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={!useNewAddress && selectedAddressId === addr._id}
                      onChange={() => {
                        setSelectedAddressId(addr._id);
                        setUseNewAddress(false);
                      }}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {addr.fullName} · {addr.label}
                      </p>
                      <p className="text-gray-500">
                        {addr.addressLine1}, {addr.city}, {addr.region}
                      </p>
                      <p className="text-gray-500">{addr.phone}</p>
                    </div>
                  </label>
                ))}
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    useNewAddress
                      ? "border-primary-400 bg-primary-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress(true)}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Use a new address
                  </span>
                </label>
              </div>
            )}

            {useNewAddress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? "input-error" : "input"}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="024XXXXXXX"
                    className={errors.phone ? "input-error" : "input"}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address Line 1 *
                  </label>
                  <input
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    className={errors.addressLine1 ? "input-error" : "input"}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address Line 2
                  </label>
                  <input
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City *
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={errors.city ? "input-error" : "input"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Region *
                  </label>
                  <select
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    className="input"
                  >
                    {GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Option */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Delivery Option
            </h2>
            <div className="space-y-2">
              {DELIVERY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    deliveryOption === opt.value
                      ? "border-primary-400 bg-primary-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryOption === opt.value}
                      onChange={() => setDeliveryOption(opt.value)}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    GH₵{opt.fee}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Order Items ({itemCount})
            </h2>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      "https://placehold.co/60x60?text=?"
                    }
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    GH₵{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

            <Alert type={alert.type} message={alert.message} />

            {/* Coupon */}
            <div className="mb-5 mt-2">
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-sm text-green-700 font-medium">
                    "{coupon.code}" applied — GH₵{discount.toLocaleString()} off
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-green-700 hover:text-green-900"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    className="input text-sm py-2"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="btn-secondary text-sm shrink-0"
                  >
                    {couponLoading ? <Spinner size="sm" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
              )}
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>GH₵{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>GH₵{shippingFee.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>−GH₵{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900 text-base">
                <span>Total</span>
                <span>GH₵{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50"
            >
              {loading ? (
                <Spinner size="sm" color="white" />
              ) : (
                `Pay GH₵${total.toLocaleString()}`
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z"
                />
              </svg>
              Secured by Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
