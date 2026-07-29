import { useState } from "react";

const FAQ_DATA = [
    {
        question: "How do I track my shipment?",
        answer: "Enter your unique tracking number on the Track Shipment page to view real-time updates on your shipment's location, status, and estimated delivery time."
    },
    {
        question: "How do I create a new shipment?",
        answer: "Log in to your account, navigate to the dashboard, and click on 'Add Shipment'. Fill in the sender and receiver details, then submit. A unique tracking number will be generated automatically."
    },
    {
        question: "Can I cancel or modify a shipment?",
        answer: "Yes, shipments can be cancelled as long as they have not been delivered. Contact support or use the admin dashboard to update the shipment status accordingly."
    },
    {
        question: "How is the estimated delivery time calculated?",
        answer: "ETA is calculated using real-time traffic data, distance between locations, and historical delivery patterns to provide accurate delivery time estimates."
    },
    {
        question: "Is live tracking available for all shipments?",
        answer: "Yes, every shipment comes with live GPS tracking. You can monitor the real-time location of your shipment from the moment it is picked up until it is delivered."
    },
    {
        question: "How can I contact support?",
        answer: "You can reach our support team by emailing support@raju.com or calling our helpline at 9876543210. We are available 24/7 to assist you."
    }
];

function FAQ() {

    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section
            className="py-5"
            style={{ background: "var(--brand-bg-card)" }}
        >
            <div className="container">

                <div className="text-center mb-5">

                    <span
                        className="badge px-3 py-2 mb-3"
                        style={{
                            background: "var(--brand-primary-light)",
                            color: "var(--brand-primary)",
                            borderRadius: "30px"
                        }}
                    >
                        FAQ
                    </span>

                    <h2
                        className="fw-bold"
                        style={{
                            color: "var(--brand-primary)",
                            fontSize: "3rem"
                        }}
                    >
                        Frequently Asked Questions
                    </h2>

                    <p
                        className="text-muted mt-3"
                        style={{ maxWidth: "700px", margin: "auto" }}
                    >
                        Find answers to common questions about our shipment tracking services.
                    </p>

                </div>

                <div
                    className="mx-auto"
                    style={{ maxWidth: "800px" }}
                >
                    {FAQ_DATA.map((item, index) => (
                        <div
                            key={index}
                            className="card border-0 shadow-sm mb-3"
                            style={{
                                borderRadius: "14px",
                                overflow: "hidden"
                            }}
                        >
                            <button
                                className="d-flex align-items-center justify-content-between w-100 border-0 bg-transparent px-4 py-3"
                                onClick={() => toggle(index)}
                                style={{
                                    cursor: "pointer",
                                    outline: "none"
                                }}
                            >
                                <span
                                    className="fw-semibold"
                                    style={{
                                    color: "var(--brand-primary)",
                                    fontSize: "1.05rem"
                                }}
                            >
                                {item.question}
                            </span>
                            <i
                                className={`bi ${openIndex === index ? "bi-chevron-up" : "bi-chevron-down"} ms-3`}
                                style={{
                                    color: "var(--brand-primary)",
                                        fontSize: "1.1rem",
                                        transition: "transform 0.3s"
                                    }}
                                ></i>
                            </button>
                            <div
                                className="px-4"
                                style={{
                                    maxHeight: openIndex === index ? "200px" : "0",
                                    overflow: "hidden",
                                    transition: "max-height 0.3s ease"
                                }}
                            >
                                <p
                                    className="text-muted pb-3 mb-0"
                                    style={{
                                        borderTop: "1px solid var(--bs-border-color)",
                                        paddingTop: "14px",
                                        lineHeight: "1.7"
                                    }}
                                >
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}

export default FAQ;
