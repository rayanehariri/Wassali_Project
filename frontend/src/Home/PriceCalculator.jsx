

import { useState } from "react";

export default function Prc(){
 const [distance, setDistance] = useState(5);
  const [size, setSize] = useState("500");
  const [price, setPrice] = useState(0);
  const [calculated, setCalculated] = useState(false);

  const calculatePrice = () => {
     if (distance === "" || distance === 0) return

    const basePrice = parseInt(size);
    const distanceCost = distance * 10; 
    const total = basePrice + distanceCost;
    setPrice(total);
    setCalculated(true);
  };

  return (
    <section className="calculator">
      <h2>
        <i
          className="fa-solid fa-circle-dollar-to-slot"
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "8px",
            fontSize: "32px",
            color:"#2563eb"
          }}
        />
        Calculate Your Delivery Cost
      </h2>
      <p className="subtitle">Get an instant price estimate</p>

      <div 
      className="calculator-box"
      onKeyDown={(e) => e.key === "Enter" && calculatePrice()}
      >
        <div className="form-group">
          <label htmlFor="calcDistance">Distance (km)</label>
          <input
            type="number"
            id="calcDistance"
            placeholder="Enter distance"
            min="1"
            max="50"
            value={distance}
            onChange={(e) => {
                const val = e.target.value;
                setDistance(val === "" ? "" : Number(val));
                if (val === "") setCalculated(false); 
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="calcSize">Package Size</label>
          <select
            id="calcSize"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="500">Small (&lt; 5kg) - Base 500 DA</option>
            <option value="800">Medium (5-15kg) - Base 800 DA</option>
            <option value="1200">Large (&gt; 15kg) - Base 1200 DA</option>
          </select>
        </div>

        <button
          className="btn-primary"
          style={{ width: "100%" }}
          onClick={calculatePrice}
        >
          Calculate Price
        </button>

        <div className="price-result" id="priceResult">
          <div className="price-amount">{calculated ? `${price} DA` : "0 DA"}</div>
          <div className="price-label">Estimated delivery cost</div>
        </div>
      </div>
    </section>
  );
}