const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/imageboard`);

exports.getImages = function() {
    return db
        .query(`SELECT * FROM images ORDER BY created_at DESC LIMIT 9`)
        .then(({ rows }) => {
            return rows;
        });
};

exports.getComments = function(id) {
    return db
        .query(
            `SELECT * FROM comments WHERE image_id=$1 ORDER BY created_at DESC`,
            [id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getImage = function(id) {
    return db
        .query(
            `SELECT * , (SELECT id FROM images
                WHERE id < $1
                ORDER BY id DESC
                LIMIT 1) as prev,
                (SELECT id FROM images
                    WHERE id > $1
                    ORDER BY id ASC
                    LIMIT 1) as next FROM images WHERE id=$1`,
            [id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.insertImages = function(url, username, title, description) {
    return db
        .query(
            `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *`,
            [url, username, title, description]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.insertComment = function(comment, username, image_id) {
    return db
        .query(
            `INSERT INTO comments (comment, username, image_id) VALUES ($1, $2, $3) RETURNING *`,
            [comment, username, image_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getMoreImages = function(lastId) {
    return db
        .query(
            `SELECT *, (SELECT id
                        FROM images
                        ORDER BY id ASC
                        LIMIT 1)
        AS "lowestId" FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 9`,
            [lastId]
        )
        .then(({ rows }) => rows);
};
