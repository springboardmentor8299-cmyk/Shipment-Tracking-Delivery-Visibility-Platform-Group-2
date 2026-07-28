package com.shiptrack.support_agent.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shiptrack.support_agent.dto.TicketRequest;
import com.shiptrack.support_agent.dto.TicketResponse;
import com.shiptrack.support_agent.service.TicketService;

@RestController
@RequestMapping("/api/support/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {

        this.ticketService = ticketService;

    }

    // =========================================
    // CREATE TICKET
    // =========================================

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @RequestBody TicketRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request));

    }

    // =========================================
    // GET ALL TICKETS
    // =========================================

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {

        return ResponseEntity.ok(
                ticketService.getAllTickets());

    }

    // =========================================
    // GET TICKET BY ID
    // =========================================

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ticketService.getTicket(id));

    }

    // =========================================
    // UPDATE TICKET
    // =========================================

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @RequestBody TicketRequest request) {

        return ResponseEntity.ok(
                ticketService.updateTicket(id, request));

    }

    // =========================================
    // DELETE TICKET
    // =========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id) {

        ticketService.deleteTicket(id);

        return ResponseEntity.noContent().build();

    }

}