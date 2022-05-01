<?php

namespace AppBundle\Repository;

/**
 * BrandRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class BrandRepository extends \Doctrine\ORM\EntityRepository
{
    /**
     * Get all for json.
     *
     * @return array
     */
    public function getAllForJson()
    {
        $all_brands = $this->getEntityManager()->getRepository('AppBundle:Brand')->findBy(array(), array('title' => 'ASC'));
        $ret = array();
        foreach ($all_brands as $brand) {
            $ret[] = array(
                'id' => $brand->getId(),
                'text' => $brand->getTitle(),
                'group_id' => $brand->getGroupId()
            );
        }
        return $ret;
    }

    /**
     * Get all for json.
     *
     * @return array
     */
    public function getStrategicInternationalForJson()
    {
        $all_brands = $this->getEntityManager()->getRepository('AppBundle:Brand')->findBy(array('group_id' => 1), array('title' => 'ASC'));
        $ret = array();
        foreach ($all_brands as $brand) {
            $ret[] = array(
                'id' => $brand->getId(),
                'text' => $brand->getTitle(),
                'group_id' => $brand->getGroupId()
            );
        }
        return $ret;
    }


    /**
     * Get all explore brand_ids
     *
     * @return array
     * @throws \Doctrine\DBAL\DBALException
     */
    public function getAllExploreBrandIds()
    {
        $conn = $this->getEntityManager()->getConnection();
        $sql = "SELECT DISTINCT (brand_id) FROM innovation where is_active = '1' AND stage_id IN (4, 5) AND is_frozen = '0' AND classification_id = 2";
        //$sql = 'SELECT DISTINCT(brand_id) FROM innovation WHERE is_active = :is_active AND stage_id IN (:stage_ids) AND is_frozen = :is_frozen AND classification_id = :classification_id';
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    /**
     * search user for user
     * @param string $search
     * @param int $offset
     * @param int $limit
     * @return array
     */
    public function search($search = '', $offset = 0, $limit = 5)
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder();
        $brand_ids = $this->getAllExploreBrandIds();
        $query =  $queryBuilder
            ->select(['b'])
            ->from('AppBundle:Brand', 'b');
        $query->addSelect("(CASE WHEN b.title like :search_first THEN 2 WHEN b.title like :global_search THEN 1 ELSE 0 END) AS HIDDEN ORD ");
        $query->andWhere('b.title LIKE :search_word')
            ->andWhere('b.id IN (:ids)')
            ->setParameter('search_first', $search . '%')
            ->setParameter('ids', $brand_ids)
            ->setParameter('global_search', '%' . $search . '%')
            ->setParameter('search_word', '%' . $search . '%')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->orderBy('ORD', 'DESC');
        $brands = $query->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 3600)
            ->getResult();
        $ret = array();
        foreach ($brands as $brand){
            $ret[] = array(
                'id' => $brand->getId(),
                'title' => $brand->getTitle(),
            );
        }
        return $ret;
    }
}
