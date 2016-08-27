'use strict';

const FileProvider = require('../helpers/fileprovider');
const Path = require('path');

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
		try {
			const realDirPath = Entry._toRealPath(relDirPath);
			return FileProvider.entries(realDirPath, false).map((self) => {
				const relPath = Entry._toRelativePath(self);
				const isFile = Entry._isFile(self);
				return new Entry(self, isFile, '');
			});
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	/**
	 * Find at entry
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Entry/Entry[]/null Return of Entry is file. or Entries is directory
	 */
	static at (relPath) {
		try {
			const realPath = Entry._toRealPath(relPath);
			const isFile = Entry._isFile(realPath);
			if (isFile) {
				const content = FileProvider.at(realPath);
				return new Entry(realPath, isFile, content);
			} else {
				// XXX
				return Entry.entries(relPath);
			}
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * Create by path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Entry/null Entry or null
	 */
	static create (relPath) {
		try {
			const realPath = Entry._toRealPath(relPath);
			FileProvider.create(realPath, '');
			return new Entry(realPath, true, '');
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * Update by path and content body
	 * @param string relPath Entry relative path from '/opt/app'
	 * @param string content Entry content body
	 * @return Entry/null Entry or null
	 */
	static update (relPath, content) {
		try {
			const realPath = Entry._toRealPath(relPath);
			FileProvider.update(realPath, content);
			return new Entry(realPath, true, content);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * Rename by path and to path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @param string relToPath Entry to relative path
	 * @return string/null Rename path or null
	 */
	static rename (relPath, relToPath) {
		try {
			FileProvider.rename(Entry._toRealPath(relPath), Entry._toRealPath(relToPath));
			return relToPath;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * Destroy by path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return boolean Destroy result
	 */
	static destroy (relPath) {
		try {
			FileProvider.remove(Entry._toRealPath(relPath));
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
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
