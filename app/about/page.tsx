"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

type Props = {};

const About = (props: Props) => {
  useEffect(() => {
    const appHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty("--app-height", `${window.innerHeight}px`);
    };
    window.addEventListener("resize", appHeight);
    appHeight();
  });

  return (
    <div
      className="p-4 max-h-auto flex flex-col items-center overflow-y-auto"
      style={{ maxHeight: "calc(var(--app-height) - 80px)" }}
    >
      <video className="w-2/3 border border-solid border-gray-300 rounded-md" src="./about.mov" controls >
      </video>
      <div className="flex flex-col w-2/3 items-center">
        <p className="mt-4">
          Welcome to NNiro Museum, an extraordinary canvas where creativity
          meets legacy. Here, amidst the digital halls of expression, you are
          presented with a unique opportunity to claim a piece of internet
          history. Each spot on our vast white wall awaits your personal
          touch—your story, your art, your moment frozen in time. As a patron of
          this virtual museum, you don&apos;t just buy a space; you curate an
          experience, you ignite a conversation, and you invest in a community
          that celebrates the diversity of human imagination.
        </p>

        <p className="mt-4">
          Our museum is alive, ever-evolving with the vibrant contributions of
          its members. Should the day come when our gallery is fully adorned,
          your space becomes a legacy you can pass on, a treasure you can trade.
          Imagine the possibilities as monthly challenges bring forth the chance
          to win $500, rewarding the most captivating pieces that align with
          changing themes—be it festive cheer, artistic flair, or the simple
          beauty of everyday life.
        </p>

        <p className="mt-4">
          Think of your spot as more than just a pixel; it&apos;s a plot in the
          digital realm, a piece of property that holds value, not just in the
          bytes it occupies, but in the narrative it represents. As a member of
          Nero Museum, you are not just an observer; you are an active
          participant in a grand exhibition of human connection and creativity.
          Join us, and leave your mark on a tapestry that will be admired by
          many, for generations to come.
        </p>
      </div>
    </div>
  );
};

export default About;
