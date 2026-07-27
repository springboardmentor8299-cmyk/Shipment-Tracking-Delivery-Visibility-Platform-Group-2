package com.shiptrack.tracking;

import com.shiptrack.shipment.Shipment;
import com.shiptrack.shipment.ShipmentStatus;
import com.shiptrack.tracking.dto.TrackingEventResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrackingService {

    private final TrackingEventRepository trackingEventRepository;

    public TrackingService(TrackingEventRepository trackingEventRepository) {
        this.trackingEventRepository = trackingEventRepository;
    }

    public void addTrackingEvent(
            Shipment shipment,
            ShipmentStatus status,
            String location) {

        TrackingEvent event = new TrackingEvent();

        event.setShipment(shipment);
        event.setStatus(status);
        event.setLocation(location);

        trackingEventRepository.save(event);
    }

    public List<TrackingEventResponse> getTrackingHistory(Shipment shipment) {

        return trackingEventRepository
                .findByShipmentOrderByEventTimeAsc(shipment)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TrackingEventResponse mapToResponse(TrackingEvent event) {

        TrackingEventResponse response =
                new TrackingEventResponse();

        response.setStatus(event.getStatus());
        response.setLocation(event.getLocation());
        response.setEventTime(event.getEventTime());

        return response;
    }
}