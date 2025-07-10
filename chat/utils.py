def get_private_room_name(user1_id, user2_id):
    sorted_ids = sorted([user1_id, user2_id])
    return f"private_chat_{sorted_ids[0]}_{sorted_ids[1]}"
