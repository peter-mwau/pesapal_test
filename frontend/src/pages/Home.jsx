import React from "react";
import { ProductsContext } from "../contexts/productsContext";

function Home() {
  const { products } = React.useContext(ProductsContext);

  console.log("Items: ", products);

  return (
    <div className="bg-gray-300 h-screen pt-[100px] text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">
        Welcome to the Home Page
      </h1>
      <p className="text-lg">This is a simple home page component.</p>
      {products?.map((product) => (
        <div key={product.id} className="bg-white p-4 m-4 rounded shadow">
          <h2 className="text-2xl font-semibold mb-2">{product.title}</h2>
          <p className="text-gray-700">{product.description}</p>
          <p className="text-xl font-bold mt-2">${product.price}</p>
          <img
            src={product.image}
            alt={product.title}
            className="w-32 h-32 object-contain mx-auto mt-2"
          />
        </div>
      ))}
    </div>
  );
}

export default Home;
