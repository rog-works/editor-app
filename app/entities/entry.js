'use strict';

const FileProvider = require('../helpers/fileprovider');
const Path = require('path');
const Promise = require('promise');

/** XXX root directory */
const ROOT_DIRECTORY = '/opt/app';

class Entry {
	/**
	 * Create instance
	 * @param string realPath real path
	 * @param strring isFile is file type
	 * @param string content content
	 */
	constructor (realPath, isFile, content) {
		const relPath = Entry._toRelativePath(realPath);
		this.path = relPath;
		this.isFile = isFile;
		this.content = content;
	}

	/**
	 * Get keys
	 * @return string[] keys
	 */
	static keys () {
		return ['path', 'isFile', 'content'];
	}

	/**
	 * Get all entries from '/opt/app'
	 * @param string relDirPath Target directory relative path from '/opt/app'
	 * @return Entry[] entries
	 */
	static entries (relDirPath = '') {
		return new Promise((resolve, reject) => {
			const realDirPath = Entry._toRealPath(relDirPath);
			FileProvider.entries(realDirPath, false)
				.then((entries) => {
					resolve(entries.map((self) => {
						const relPath = Entry._toRelativePath(self);
						const isFile = Entry._isFile(self);
						return new Entry(self, isFile, '');
					}));
				})
				.catch(reject);
		});
	}

	/**
	 * Find at entry
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Entry Return of Entry
	 */
	static at (relPath) {
		return new Promise((resolve, reject) => {
			const realPath = Entry._toRealPath(relPath);
			const isFile = Entry._isFile(realPath);
			if (isFile) {
				FileProvider.at(realPath)
					.then((content) => {
						resolve(new Entry(realPath, isFile, content));
					})
					.catch(reject);
			} else {
				resolve(new Entry(realPath, isFile, ''));
			}
		});
	}

	/**
	 * Create by path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Entry/null Entry or null
	 */
	static create (relPath) {
		return new Promise((resolve, reject) => {
			const realPath = Entry._toRealPath(relPath);
			FileProvider.create(realPath).then(resolve).catch(reject);
		});
	}

	/**
	 * Update by path and content body
	 * @param string relPath Entry relative path from '/opt/app'
	 * @param string content Entry content body
	 * @return Entry/null Entry or null
	 */
	static update (relPath, content) {
		return new Promise((resolve, reject) => {
			const realPath = Entry._toRealPath(relPath);
			FileProvider.update(realPath, content).then(resolve).catch(reject);
		});
	}

	/**
	 * Rename by path and to path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @param string relToPath Entry to relative path
	 * @return string/null Rename path or null
	 */
	static rename (relPath, relToPath) {
		return new Promise((resolve, reject) => {
			FileProvider.rename(Entry._toRealPath(relPath), Entry._toRealPath(relToPath)).then(resolve).catch(reject);
		});
	}

	/**
	 * Destroy by path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return boolean Destroy result
	 */
	static destroy (relPath) {
		return new Promise((resolve, reject) => {
			FileProvider.remove(Entry._toRealPath(relPath)).then(resolve).catch(reject);
		});
	}

	/**
	 * Check entry is file
	 * @param string realPath Entity real path
	 * @return string entry is file of true
	 */
	static _isFile (realPath) {
		return FileProvider.isFile(realPath);
	}

	/**
	 * Relative path to real path
	 * @param string relPath Entry relative path
	 * @return string Real path
	 */
	static _toRealPath (relPath) {
		return ROOT_DIRECTORY + relPath;
	}

	/**
	 * Real path to Relative path
	 * @param string realPath Entry real path
	 * @return string Relative path
	 */
	static _toRelativePath (realPath) {
		return realPath.substr(ROOT_DIRECTORY.length);
	}
}

module.exports = Entry;
