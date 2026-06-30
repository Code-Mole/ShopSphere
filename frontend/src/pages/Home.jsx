export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {/* Gradient heading */}
      <div className="mb-6">
        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-sm font-medium rounded-full mb-4">
          AI-Powered Shopping
        </span>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
          Shop
          <span className="text-primary-600">Sphere</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-xl mx-auto">
          Discover products you'll love, powered by intelligent recommendations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button className="btn-primary text-base px-8 py-3">
          Start Shopping
        </button>
        <button className="btn-secondary text-base px-8 py-3">
          Learn More
        </button>
      </div>

      {/* Stats row */}
      <div className="mt-16 grid grid-cols-3 gap-8 text-center">
        {[
          { label: "Products", value: "10,000+" },
          { label: "Customers", value: "50,000+" },
          { label: "Satisfaction", value: "99%" },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
