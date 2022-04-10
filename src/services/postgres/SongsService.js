const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const {mapDBToModelSong} = require('../../utils/song');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({title, year, genre, performer, duration, albumId}) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  // failed
  //   async getSongs() {
  //     const result = await this._pool.query('SELECT * FROM songs');
  //     return result.rows.map(mapDBToModelSong);
  //   }

  // failed
  //   async getSongs(id, title, performer) {
  //     const query = {
  //       text: 'SELECT $1, $2, $3 FROM songs',
  //       values: [id, title, performer],
  //     };
  //     const result = await this._pool.query(query);
  //     return result.rows.map((song) => ({id: song.id, title: song.title, performer: song.performer}));
  //   }

  async getSongs(request, h) {
    const {title, performer} = request.query;
    let filteredSongs = await this._pool.query('SELECT id, title, performer FROM songs');

    if (title !== undefined) {
      filteredSongs = filteredSongs.filter((song) => song.title === title);
    }

    if (performer !== undefined) {
      filteredSongs = filteredSongs.filter((song) => song.performer === performer);
    }

    filteredSongs = filteredSongs.rows.map((song) => (
      {
        id: song.id,
        title: song.title,
        performer: song.performer,
      }));

    const response = h.response({
      status: 'success',
      data: {
        songs: filteredSongs,
      },
    });

    response.code(200);
    return response;
  }

  // berhasil
  //   async getSongs() {
  //     const result = await this._pool.query('SELECT id, title, performer FROM songs');
  //     return result.rows.map((song) => ({id: song.id, title: song.title, performer: song.performer}));
  //   }
  // berhasil
  //   async getSongs() {
  //     const result = await this._pool.query('SELECT id, title, performer FROM songs');
  //     return result.rows.map(mapDBToModelSong);
  //   }
  // berhasil
  //   async getSongs() {
  //     const result = await this._pool.query('SELECT * FROM songs');
  //     return result.rows.map((song) => ({id: song.id, title: song.title, performer: song.performer}));
  //   }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows.map(mapDBToModelSong)[0];
  }

  async editSongById(id, {title, year, genre, performer, duration, albumId}) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
