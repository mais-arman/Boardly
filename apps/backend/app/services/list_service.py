from app.extensions import db
from app.models.board import Board
from app.models.board_list import BoardList
from app.models.board_role import Permission
from app.services.board_permission_service import BoardPermissionService
from app.utils.exceptions import ForbiddenError, NotFoundError, BadRequestError


class ListService:

    @staticmethod
    def get_board_lists(user_id, board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.VIEW_BOARD,
        ):
            raise ForbiddenError("You do not have permission to view lists")

        return (
            BoardList.query
            .filter_by(board_id=board_id)
            .order_by(BoardList.position.asc())
            .all()
        )

    @staticmethod
    def get_list(user_id, list_id):
        board_list = db.session.get(BoardList, list_id)

        if not board_list:
            raise NotFoundError("List not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_list.board_id,
            Permission.VIEW_BOARD,
        ):
            raise ForbiddenError("You do not have permission to view this list")

        return board_list

    @staticmethod
    def create_list(user_id, board_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.CREATE_LIST,
        ):
            raise ForbiddenError("You do not have permission to create lists")

        max_position = (
            db.session.query(db.func.max(BoardList.position))
            .filter_by(board_id=board_id)
            .scalar()
        )

        next_position = 0 if max_position is None else max_position + 1

        board_list = BoardList(
            board_id=board_id,
            title=data["title"].strip(),
            position=next_position,
        )

        db.session.add(board_list)
        db.session.commit()

        return board_list

    @staticmethod
    def update_list(user_id, list_id, data):
        board_list = db.session.get(BoardList, list_id)

        if not board_list:
            raise NotFoundError("List not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_list.board_id,
            Permission.CREATE_LIST,
        ):
            raise ForbiddenError("You do not have permission to update lists")

        board_list.title = data["title"].strip()

        db.session.commit()

        return board_list

    @staticmethod
    def delete_list(user_id, list_id):
        board_list = db.session.get(BoardList, list_id)

        if not board_list:
            raise NotFoundError("List not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_list.board_id,
            Permission.CREATE_LIST,
        ):
            raise ForbiddenError("You do not have permission to delete lists")

        db.session.delete(board_list)
        db.session.commit()

    @staticmethod
    def reorder_lists(user_id, board_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.CREATE_LIST,
        ):
            raise ForbiddenError("You do not have permission to reorder lists")

        list_ids = [item["id"] for item in data["lists"]]

        existing_lists = (
            BoardList.query
            .filter(
                BoardList.board_id == board_id,
                BoardList.id.in_(list_ids),
            )
            .all()
        )

        if len(existing_lists) != len(list_ids):
            raise BadRequestError("One or more lists do not belong to this board")

        lists_by_id = {
            board_list.id: board_list
            for board_list in existing_lists
        }

        used_positions = set()

        for item in data["lists"]:
            position = item["position"]

            if position in used_positions:
                raise BadRequestError("Duplicate list positions are not allowed")

            used_positions.add(position)
            lists_by_id[item["id"]].position = position

        db.session.commit()

        return (
            BoardList.query
            .filter_by(board_id=board_id)
            .order_by(BoardList.position.asc())
            .all()
        )