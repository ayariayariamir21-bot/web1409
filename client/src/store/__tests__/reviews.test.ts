/**
 * Characterization tests — review moderation (client-side).
 *
 * KEEP: approve/reject/delete/reply transitions, untouched siblings,
 * unknown-id no-ops.
 * CHANGE: moderation currently happens in localStorage with no authorship
 * proof and no admin permission check — the server must own status
 * transitions and reply attribution.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { useReviewsStore } from "@/store/reviewsStore";
import type { Review } from "@/lib/mockReviews";

function review(overrides: Partial<Review> & { id: string }): Review {
  return {
    productId: "sw-01",
    customerName: "Test Customer",
    rating: 5,
    title: "Great",
    body: "Helped me ship faster.",
    createdAt: "2025-01-01T00:00:00.000Z",
    status: "pending",
    ...overrides,
  };
}

function seedReviews() {
  localStorage.clear();
  useReviewsStore.setState({
    reviews: [
      review({ id: "rv-01", status: "pending" }),
      review({ id: "rv-02", status: "pending", rating: 2 }),
      review({ id: "rv-03", status: "approved" }),
    ],
  });
}

beforeEach(() => {
  seedReviews();
});

function statusOf(id: string) {
  return useReviewsStore.getState().reviews.find((r) => r.id === id)?.status;
}

describe("review moderation (KEEP transitions, CHANGE authority)", () => {
  it("approves a pending review", () => {
    useReviewsStore.getState().approve("rv-01");

    expect(statusOf("rv-01")).toBe("approved");
  });

  it("rejects a pending review", () => {
    useReviewsStore.getState().reject("rv-01");

    expect(statusOf("rv-01")).toBe("rejected");
  });

  it("leaves sibling reviews untouched", () => {
    useReviewsStore.getState().approve("rv-01");

    expect(statusOf("rv-02")).toBe("pending");
    expect(statusOf("rv-03")).toBe("approved");
  });

  it("deletes a review by id", () => {
    useReviewsStore.getState().delete("rv-01");

    expect(
      useReviewsStore.getState().reviews.map((r) => r.id),
    ).toEqual(["rv-02", "rv-03"]);
  });

  it("attaches an admin reply with text", () => {
    useReviewsStore.getState().reply("rv-01", "Thanks for the feedback!");

    const replied = useReviewsStore
      .getState()
      .reviews.find((r) => r.id === "rv-01");
    expect(replied?.reply?.text).toBe("Thanks for the feedback!");
    // LEGACY: reply carries no author/role — server must attribute it.
    expect(replied?.status).toBe("pending");
  });

  it("ignores unknown ids on every mutation", () => {
    const before = useReviewsStore.getState().reviews;
    const api = useReviewsStore.getState();
    api.approve("rv-999");
    api.reject("rv-999");
    api.delete("rv-999");
    api.reply("rv-999", "hello");

    expect(useReviewsStore.getState().reviews).toEqual(before);
  });
});
