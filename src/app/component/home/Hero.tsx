"use client";

import { useState, useEffect } from "react";

const slides = [
  {
    title: "Avengers: Secret Wars",
    subtitle: "Cuộc chiến cuối cùng của vũ trụ Marvel",
    description: "Trải nghiệm hành trình epic với những siêu anh hùng yêu thích",
    button: "Đặt vé ngay",
    image:
      "/logo/logo.png",
  },
  {
    title: "The Last Kingdom",
    subtitle: "Hành trình của những chiến binh huyền thoại",
    description: "Khám phá thế giới trung cổ đầy bí ẩn và phiêu lưu",
    button: "Xem trailer",
    image:
      "/logo/logo.png",
  },
  {
    title: "Space Odyssey 2024",
    subtitle: "Cuộc phiêu lưu vào không gian sâu thẳm",
    description: "Hành trình khám phá vũ trụ với công nghệ tương lai",
    button: "Khám phá",
    image:
      "/logo/logo.png",
  },
  {
    title: "Dark Shadows",
    subtitle: "Bí ẩn ẩn giấu trong bóng tối",
    description: "Câu chuyện kinh dị đầy hồi hộp và bất ngờ",
    button: "Xem ngay",
    image:
      "/logo/logo.png",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[700px] overflow-hidden">
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/50"></div>

              <div className="relative container mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl text-white">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl md:text-2xl mb-4 text-teal-300">
                    {slide.subtitle}
                  </h2>
                  <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
                    {slide.description}
                  </p>
                  <button className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full transition-colors cursor-pointer whitespace-nowrap">
                    {slide.button}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
      >
        <i className="ti ti-chevron-left text-2xl"></i>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
      >
        <i className="ti ti-chevron-right text-2xl"></i>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
              index === current ? "bg-teal-500" : "bg-white/50 hover:bg-white/70"
            }`}
          ></button>
        ))}
      </div>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-10">
        <div className="bg-white rounded-full p-2 flex items-center gap-2 shadow-2xl">
          <i className="ti ti-search text-gray-400 text-xl ml-4"></i>
          <input
            placeholder="Tìm kiếm phim, rạp chiếu..."
            className="flex-1 px-4 py-3 outline-none text-gray-800 text-base"
            type="text"
          />
          <button className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition-colors whitespace-nowrap cursor-pointer">
            Tìm kiếm
          </button>
        </div>
      </div>
    </section>
  );
}
