import React from "react";
import "../../styles/carousel.css";

export const Carousel = ({ title, games }) => {
    return (
        <div className="carousel-container">
            <h2>{title}</h2>
            <div className="carousel">
                <button className="carousel-btn left">{"<"}</button>
                <div className="carousel-items">
                    {games?.map((game, index) => (// It can be null, so add a ?
                        <div key={index} className="carousel-item">
                            <img src={game.image} alt={game.name} />
                        </div>
                    )) || []}
                </div>
                <button className="carousel-btn right">{">"}</button>
            </div>
        </div>
    );
};


