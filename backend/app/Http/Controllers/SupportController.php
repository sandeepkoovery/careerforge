<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SupportController extends Controller
{
    private function checkAdmin(Request $request): void
    {
        if (! $request->user() || ! $request->user()->is_admin) {
            abort(403, 'Unauthorized. Admin privileges required.');
        }
    }

    /**
     * Get tickets for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $tickets = SupportTicket::where('user_id', $user->id)
            ->withCount('messages')
            ->with(['latestMessage'])
            ->orderByRaw("FIELD(status, 'open', 'in_progress', 'answered', 'waiting_user', 'resolved', 'closed')")
            ->latest('updated_at')
            ->get();

        return response()->json([
            'tickets' => $tickets,
            'counts' => [
                'total' => $tickets->count(),
                'active' => $tickets->whereIn('status', ['open', 'in_progress', 'answered', 'waiting_user'])->count(),
                'resolved' => $tickets->whereIn('status', ['resolved', 'closed'])->count(),
            ],
        ]);
    }

    /**
     * Create a new ticket (user side)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string|in:general,billing,technical,templates,ai_tools,account',
            'priority' => 'required|string|in:low,medium,high,urgent',
            'message' => 'required|string|min:5|max:10000',
        ]);

        $user = $request->user();

        // Generate unique ticket number (e.g. TKT-2610-A8F2)
        do {
            $ticketNumber = 'TKT-' . date('ym') . '-' . strtoupper(Str::random(4));
        } while (SupportTicket::where('ticket_number', $ticketNumber)->exists());

        $ticket = SupportTicket::create([
            'ticket_number' => $ticketNumber,
            'user_id' => $user->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'status' => 'open',
            'last_reply_at' => now(),
        ]);

        $message = SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_admin_reply' => false,
        ]);

        $ticket->load(['user:id,name,email,is_pro', 'messages.user:id,name,email,is_admin,is_pro']);

        return response()->json([
            'message' => 'Support ticket created successfully.',
            'ticket' => $ticket,
        ], 201);
    }

    /**
     * Get ticket details with message history (user side)
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $ticket = SupportTicket::where('user_id', $user->id)
            ->where('id', $id)
            ->with(['messages.user:id,name,email,is_admin,is_pro'])
            ->firstOrFail();

        return response()->json([
            'ticket' => $ticket,
        ]);
    }

    /**
     * Add reply to a ticket (user side)
     */
    public function reply(Request $request, $id)
    {
        $validated = $request->validate([
            'message' => 'required|string|min:1|max:10000',
        ]);

        $user = $request->user();

        $ticket = SupportTicket::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $reply = SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_admin_reply' => false,
        ]);

        // If ticket was closed or answered, reopening to 'open'
        $ticket->update([
            'status' => 'open',
            'last_reply_at' => now(),
        ]);

        $reply->load('user:id,name,email,is_admin,is_pro');

        return response()->json([
            'message' => 'Reply submitted.',
            'reply' => $reply,
            'ticket' => $ticket->fresh(['messages.user:id,name,email,is_admin,is_pro']),
        ]);
    }

    /**
     * Close a ticket (user side)
     */
    public function close(Request $request, $id)
    {
        $user = $request->user();

        $ticket = SupportTicket::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $ticket->update([
            'status' => 'closed',
        ]);

        return response()->json([
            'message' => 'Ticket closed successfully.',
            'ticket' => $ticket,
        ]);
    }

    /* =========================================================================
     * ADMIN ENDPOINTS
     * ========================================================================= */

    /**
     * List all tickets for admin
     */
    public function adminIndex(Request $request)
    {
        $this->checkAdmin($request);

        $query = SupportTicket::with(['user:id,name,email,is_pro,is_admin,trial_ends_at', 'latestMessage'])
            ->withCount('messages');

        // Filters
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'LIKE', $search)
                    ->orWhere('subject', 'LIKE', $search)
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'LIKE', $search)
                            ->orWhere('email', 'LIKE', $search);
                    });
            });
        }

        $tickets = $query->orderByRaw("FIELD(status, 'open', 'in_progress', 'waiting_user', 'answered', 'resolved', 'closed')")
            ->latest('updated_at')
            ->get();

        $allTickets = SupportTicket::all();
        $counts = [
            'total' => $allTickets->count(),
            'open' => $allTickets->where('status', 'open')->count(),
            'in_progress' => $allTickets->where('status', 'in_progress')->count(),
            'answered' => $allTickets->where('status', 'answered')->count(),
            'waiting_user' => $allTickets->where('status', 'waiting_user')->count(),
            'resolved' => $allTickets->where('status', 'resolved')->count(),
            'closed' => $allTickets->where('status', 'closed')->count(),
        ];

        return response()->json([
            'tickets' => $tickets,
            'counts' => $counts,
        ]);
    }

    /**
     * View single ticket in admin
     */
    public function adminShow(Request $request, $id)
    {
        $this->checkAdmin($request);

        $ticket = SupportTicket::with([
            'user:id,name,email,is_pro,is_admin,trial_ends_at,last_login_country,last_login_at',
            'messages.user:id,name,email,is_admin,is_pro',
        ])->findOrFail($id);

        return response()->json([
            'ticket' => $ticket,
        ]);
    }

    /**
     * Admin reply to a ticket
     */
    public function adminReply(Request $request, $id)
    {
        $this->checkAdmin($request);

        $validated = $request->validate([
            'message' => 'required|string|min:1|max:10000',
            'status' => 'nullable|string|in:open,in_progress,answered,waiting_user,resolved,closed',
        ]);

        $ticket = SupportTicket::findOrFail($id);

        $message = SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'is_admin_reply' => true,
        ]);

        $newStatus = $validated['status'] ?? 'answered';
        $ticket->update([
            'status' => $newStatus,
            'last_reply_at' => now(),
        ]);

        $ticket->load([
            'user:id,name,email,is_pro,is_admin,trial_ends_at',
            'messages.user:id,name,email,is_admin,is_pro',
        ]);

        return response()->json([
            'message' => 'Admin reply dispatched successfully.',
            'ticket' => $ticket,
        ]);
    }

    /**
     * Admin updates status or priority of a ticket
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        $this->checkAdmin($request);

        $validated = $request->validate([
            'status' => 'nullable|string|in:open,in_progress,answered,waiting_user,resolved,closed',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
        ]);

        $ticket = SupportTicket::findOrFail($id);

        $update = [];
        if (isset($validated['status'])) {
            $update['status'] = $validated['status'];
        }
        if (isset($validated['priority'])) {
            $update['priority'] = $validated['priority'];
        }

        if (! empty($update)) {
            $ticket->update($update);
        }

        return response()->json([
            'message' => 'Ticket updated successfully.',
            'ticket' => $ticket->fresh(['user:id,name,email,is_pro,is_admin', 'messages.user:id,name,email,is_admin,is_pro']),
        ]);
    }

    /**
     * Admin deletes a ticket
     */
    public function adminDelete(Request $request, $id)
    {
        $this->checkAdmin($request);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket deleted successfully.',
        ]);
    }
}
