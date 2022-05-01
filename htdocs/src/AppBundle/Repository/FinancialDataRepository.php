<?php

namespace AppBundle\Repository;

use AppBundle\Entity\Activity;
use AppBundle\Entity\FinancialData;
use AppBundle\Entity\Innovation;
use AppBundle\Entity\Settings;
use AppBundle\Entity\User;

/**
 * FinancialDataRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class FinancialDataRepository extends \Doctrine\ORM\EntityRepository
{

    /**
     * Get financial data by innovation_id and key.
     *
     * @param int $innovation_id
     * @param $key
     * @return FinancialData|null
     */
    public function getFinancialDataByInnovationIdAndKey($innovation_id, $key)
    {
        return $this->getEntityManager()->getRepository('AppBundle:FinancialData')->findOneBy(
            array(
                'key' => $key,
                'innovation' => $innovation_id
            )
        );
    }

    /**
     *
     * Calculate Total Ap From Product Array
     *
     * @param $products
     * @param null $date
     * @return float|int
     */
    public function calculateTotalApFromProductArray($products, $date = null)
    {
        $settings = $this->getEntityManager()->getRepository('AppBundle:Settings')->getCurrentSettings();


        $total = 0;
        // ABS(AP + CI)
        $libelle_ap_LEnY = "advertising_promotion_" . $settings->getLibelleLastEstimateNextYear($date);
        $libelle_ci_LEnY = "central_investment_" . $settings->getLibelleLastEstimateNextYear($date);

        if (!$products)
            return 0;

        for ($i = 0; $i < count($products); ++$i) {
            $aProduct = $products[$i];
            $quarterly_data_ci_LEnY = $this->getFinancialDataByInnovationIdAndKey($aProduct['id'], $libelle_ci_LEnY);
            $quarterly_data_ap_LEnY = $this->getFinancialDataByInnovationIdAndKey($aProduct['id'], $libelle_ap_LEnY);
            $ci_value = ($quarterly_data_ci_LEnY) ? $quarterly_data_ci_LEnY->getCalculableValue() : 0;
            $ap_value = ($quarterly_data_ap_LEnY) ? $quarterly_data_ap_LEnY->getCalculableValue() : 0;
            $total_ap_value = $ci_value + $ap_value;
            $total += abs($total_ap_value);
        }
        return round($total);
    }


    /**
     *
     * Calculate Caap From Product Array
     *
     * @param $products
     * @param null $date
     * @return float
     */
    function calculateCaapFromProductArray($products, $date = null)
    {
        $settings = $this->getEntityManager()->getRepository('AppBundle:Settings')->getCurrentSettings();

        // Contributive Margin – ABS(Total A&P)
        $libelle_cm_LEnY = "contributing_margin_" . $settings->getLibelleLastEstimateNextYear($date);
        $total_ap = 0;
        $total_cm = 0;
        for ($i = 0; $i < count($products); ++$i) {
            $aProduct = $products[$i];
            $quarterly_data_cm_LEnY = $this->getFinancialDataByInnovationIdAndKey($aProduct['id'], $libelle_cm_LEnY);
            $cm_value = ($quarterly_data_cm_LEnY) ? $quarterly_data_cm_LEnY->getCalculableValue() : 0;
            $total_cm += $cm_value;
        }
        $total_ap = abs($this->calculateTotalApFromProductArray($products, $date));
        $total = $total_cm - $total_ap;
        return round($total);
    }

    /**
     * Get HTML automated financial data for date.
     *
     * @param Settings $settings
     * @param Innovation $innovation
     * @param string $date
     * @return array
     */
    public function getHtmlAutomatedFinancialDataForDate($settings, $innovation, $date)
    {
        $ret = array(
            'fields' => array(),
            'innovation' => $innovation,
            'keys' => array()
        );
        $financial_data = $innovation->getProperFinancialDatas($settings, $date, true);
        $current_stage = ($innovation->getStage()) ? $innovation->getStage()->getCssClass() : 'empty';
        $ret['fields']['total_ap'] = array();
        if(!$innovation->isAService()){
            $ret['fields']['caap'] = array();
            $ret['fields']['cm_per_case'] = array();
        }
        if(!$innovation->isAService() && !in_array($current_stage, ['discover', 'ideate', 'experiment'])){
            $ret['fields']['cogs_per_case'] = array();
        }
        $financial_dates = $settings->getFinancialDataTableDates($date);
        foreach ($financial_dates as $date){
            $id = FinancialData::cleanFieldLibelle($date);
            $central_investment_value = ($financial_data && array_key_exists('central_investment_' . $id, $financial_data)) ? $financial_data['central_investment_' . $id] : '';
            $central_investment_value_is_valid = ($central_investment_value !== '');
            $central_investment_value = ($central_investment_value === "N/A") ? 0 : $central_investment_value;

            $advertising_promotion_value = ($financial_data && array_key_exists('advertising_promotion_' . $id, $financial_data)) ? $financial_data['advertising_promotion_' . $id] : '';
            $advertising_promotion_value_is_valid = ($advertising_promotion_value !== '');
            $advertising_promotion_value = ($advertising_promotion_value === "N/A") ? 0 : $advertising_promotion_value;


            $contributing_margin_value = ($financial_data && array_key_exists('contributing_margin_' . $id, $financial_data)) ? $financial_data['contributing_margin_' . $id] : '';
            $contributing_margin_value_is_valid = ($contributing_margin_value !== '');
            $contributing_margin_value = ($contributing_margin_value === "N/A") ? 0 : $contributing_margin_value;

            $volume_value = ($financial_data && array_key_exists('volume_' . $id, $financial_data)) ? $financial_data['volume_' . $id] : '';
            $volume_value_is_valid = ($volume_value !== '');
            $volume_value = ($volume_value === "N/A") ? 0 : $volume_value;

            $cogs_value = ($financial_data && array_key_exists('cogs_' . $id, $financial_data)) ? $financial_data['cogs_' . $id] : '';
            $cogs_value_is_valid = ($cogs_value !== '');
            $cogs_value = ($cogs_value === "N/A") ? 0 : $cogs_value;

            $total_ap = ($central_investment_value_is_valid) ? $central_investment_value : "N/A";
            if ($advertising_promotion_value_is_valid) {
                $total_ap = ($total_ap == 'N/A') ? $advertising_promotion_value : $total_ap + $advertising_promotion_value;
            }
            $ret['fields']['total_ap'][] = FinancialData::returnFinancialDateFormatted($total_ap);
            if(!$innovation->isAService()){
                $caap = ($contributing_margin_value_is_valid) ? $contributing_margin_value : "N/A";
                if ($total_ap != 'N/A') {
                    $caap = ($caap == 'N/A') ? -abs($total_ap) : $caap - abs($total_ap);
                }
                $cm_per_case_value = ($contributing_margin_value_is_valid && $volume_value_is_valid && $contributing_margin_value != 0 && $volume_value != 0) ? ($contributing_margin_value / $volume_value) : "N/A";
                $cm_per_case = ($cm_per_case_value != "N/A") ? number_format($cm_per_case_value, 2) : $cm_per_case_value;

                $ret['fields']['caap'][] = FinancialData::returnFinancialDateFormatted($caap);
                $ret['fields']['cm_per_case'][] = FinancialData::returnFinancialDateFormatted($cm_per_case);
            }
            if(!$innovation->isAService() && !in_array($current_stage, ['discover', 'ideate', 'experiment'])){
                $cogs_per_case_value = ($cogs_value_is_valid && $volume_value_is_valid && $cogs_value != 0 && $volume_value != 0) ? ($cogs_value / $volume_value) : "N/A";
                $cogs_per_case = ($cogs_per_case_value != "N/A") ? number_format($cogs_per_case_value, 2) : $cogs_per_case_value;
                $ret['fields']['cogs_per_case'][] = FinancialData::returnFinancialDateFormatted($cogs_per_case);
            }
        }
        return $ret;
    }


    /**
     * Get HTML financial data for date.
     *
     * @param User $user
     * @param Settings $settings
     * @param Innovation $innovation
     * @param string $date
     * @return string
     */
    public function getHtmlFinancialDataForDate($user, $settings, $innovation, $date)
    {
        $disabled = (!$settings->isDateCurrentExercise($date));
        if (!$disabled) {
            $current_stage = ($innovation->getStage()) ? $innovation->getStage()->getCssClass() : 'empty';
            $disabled = (!$user->hasAdminRights() && in_array($current_stage, array('discontinued', 'permanent_range')));
            if (!$disabled && !$user->hasAdminRights() && !$settings->getIsEditionQuantiEnabled()) {
                $disabled = true;
            }
        }
        $the_current_date = $settings->getCurrentFinancialDate();
        $date_next = $settings->getNextFinancialDate();
        if ($date != $the_current_date && $date != $date_next) {
            $disabled = true;
        }
        return [
                'the_user' => $user,
                'financial_data' => $innovation->getProperFinancialDatas($settings, $date, true),
                'innovation' => $innovation,
                'disabled' => $disabled,
                'fields' => $settings->getFinancialDataTableFieldsForInnovation($innovation, $date)
            ];
    }


    /**
     * Create or update FinancialData.
     *
     * @param User $user
     * @param Innovation $innovation
     * @param string $libelle
     * @param string $value
     * @param bool $create_activity
     * @return FinancialData
     */
    public function createOrUpdateFinancialData($user, $innovation, $libelle, $value, $create_activity = true)
    {
        if (!$libelle || !$user || !$innovation) {
            return false;
        }
        $em = $this->getEntityManager();
        $financialData = $innovation->getFinancialDataByKey($libelle);
        if (!$financialData) {
            $financialData = new FinancialData();
        }
        $old_value = $financialData->getValue();
        $financialData->setInnovation($innovation);
        $financialData->setKey($libelle);
        $financialData->setValue($value);

        $em->persist($financialData);
        $em->flush();

        if ($create_activity && $old_value != $value) {
            $em->getRepository('AppBundle:Activity')->createActivity($user, $innovation, Activity::ACTION_INNOVATION_UPDATED, $libelle, null, $old_value, $value, $financialData);
        }
        return $financialData;
    }
}
